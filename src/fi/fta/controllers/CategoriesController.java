package fi.fta.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.Category;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.CategorySummaryUI;
import fi.fta.beans.ui.CategoryUI;
import fi.fta.beans.ui.TreeBranchUI;
import fi.fta.data.managers.CategoryManager;
import fi.fta.model.SiteModel;
import fi.fta.utils.AttachmentsUtils;
import fi.fta.utils.BeansUtils;
import fi.fta.utils.SummaryWorkbook;

/**
 * Controller for strictly for categories only available operations.
 * 
 * @author andrysta
 *
 */
@Controller
@RequestMapping("/categories")
public class CategoriesController
	extends CategoryBeansController<Category, CategoryUI, CategoryManager>
{
	
	public CategoriesController()
	{
		super(CategoryManager.getInstance());
	}
	
	/**
	 * Request method for retrieving all root categories when the user has rights.
	 * 
	 * @param request http request
	 * @param response http response
	 * @return list of root categories in wrapper objects
	 */
	@RequestMapping(value = "/root", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<Category>> getRoot(HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (SiteModel.get(request).canRead(null))
			{
				return SimpleResult.newSuccess(manager.getRoot());
			}
			return SimpleResult.noRightsFailure();
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getRoot", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Current user specific tree of categories. The tree will be restricted to those categories only, where user has rights to read.
	 * 
	 * @param request http request
	 * @param response http response
	 * @return list of categories wrapped in objects for JSON
	 */
	@RequestMapping(value = "/readable-tree", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<TreeBranchUI>> getReadableTree(HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(
				BeansUtils.getLayerUIs(null, SiteModel.get(request)));
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getReadableTree", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Main method for retrieving full tree of categories.
	 * 
	 * @param request http request
	 * @param response http response
	 * @return list of all categories and subcategories wrapped in objects for JSON
	 */
	@RequestMapping(value = "/tree", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<TreeBranchUI>> getTree(HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(BeansUtils.getLayerUIs(null, null));
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getTree", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Retrieve service statistics for root categories and all subcategories.
	 * 
	 * @param request http request
	 * @param response http response
	 * @return list of statistics of all categories and subcategories wrapped in objects for JSON
	 */
	@RequestMapping(value = "/summary", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<CategorySummaryUI>> getSummary(
		HttpServletRequest request, HttpServletResponse response)
	{
		return this.getSummary(null);
	}
	
	/**
	 * Retrieve service statistics for category and all subcategories.
	 * 
	 * @param id the ID of root category
	 * @param request http request
	 * @param response http response
	 * @return list of statistics of all categories and subcategories wrapped in objects for JSON
	 */
	@RequestMapping(value = "/summary/{id}", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<CategorySummaryUI>> getSummary(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		return this.getSummary(id);
	}
	
	/**
	 * Retrieve service statistics for category and all subcategories.
	 * 
	 * @param id the ID of root category
	 * @return list of statistics of all categories and subcategories wrapped in objects for JSON
	 */
	private SimpleResult<List<CategorySummaryUI>> getSummary(Long id)
	{
		try
		{
			return SimpleResult.newSuccess(BeansUtils.getSummary(id));
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getSummary(" + id + ")", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Retrieve service statistics for root categories and all subcategories in excel file format.
	 * 
	 * @param request http request
	 * @param response http response
	 * @return list of statistics of all categories and subcategories in excel file
	 */
	@RequestMapping(value = "/summary-download", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getSummaryExcel(
		HttpServletRequest request, HttpServletResponse response)
	{
		return this.getSummaryExcel((Long)null, (Integer)null);
	}
	
	/**
	 * Retrieve service statistics for root categories and all subcategories in excel file format.
	 * Counts statistics for top level categories or bottom level categories if depth is negative.
	 * 
	 * @param depth depth of categories tree path to sum up statistics
	 * @param request http request
	 * @param response http response
	 * @return list of statistics of all categories and subcategories in excel file
	 */
	@RequestMapping(value = "/summary-download/{depth}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getSummaryExcel(
		@PathVariable("depth") Integer depth, HttpServletRequest request, HttpServletResponse response)
	{
		return this.getSummaryExcel(null, depth);
	}
	
	/**
	 * Retrieve service statistics for root categories and all subcategories in excel file format.
	 * 
	 * @param root root category to start from
	 * @param depth depth of categories tree path to sum up statistics
	 * @return list of statistics of all categories and subcategories in excel file
	 */
	private ResponseEntity<?> getSummaryExcel(Long root, Integer depth)
	{
		try
		{
			SummaryWorkbook sw = new SummaryWorkbook();
			sw.set(root, depth);
			return AttachmentsUtils.prepareExcelResponse(sw.getWorkbook(), "summary.xlsx");
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getSummaryExcel", ex);
			return new ResponseEntity<String>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
}
