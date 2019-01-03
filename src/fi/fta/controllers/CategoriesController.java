package fi.fta.controllers;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.Category;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.CategoryBeanActionParamsUI;
import fi.fta.beans.ui.CategoryBeanActionUI;
import fi.fta.beans.ui.CategorySummaryUI;
import fi.fta.beans.ui.CategoryUI;
import fi.fta.beans.ui.TreeBranchUI;
import fi.fta.data.managers.CategoryBeanActionManager;
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
	 * Retrieve service statistics for any category (also root categories) and all subcategories.
	 * Counts statistics for top level categories, or bottom level categories, if depth is negative.
	 * 
	 * @param id the ID of root category (optional)
	 * @param depth depth of categories tree path to sum up statistics (optional)
	 * @param request http request
	 * @param response http response
	 * @return list of statistics of all categories and subcategories wrapped in objects for JSON
	 */
	@RequestMapping(value = "/summary", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<CategorySummaryUI>> getSummary(
		@RequestParam(value="id", required=false) Long id,
		@RequestParam(value="depth", required=false) Integer depth,
		HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(BeansUtils.getSummary(id, depth));
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getSummary(" + id + "," + depth + ")", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Retrieve service statistics for root categories and all subcategories in excel file format.
	 * Counts statistics for top level categories, or bottom level categories, if depth is negative.
	 * 
	 * @param id the ID of root category (optional)
	 * @param depth depth of categories tree path to sum up statistics
	 * @param request http request
	 * @param response http response
	 * @return list of statistics of all categories and subcategories in excel file
	 */
	@RequestMapping(value = "/summary-download", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<?> getSummaryExcel(
		@RequestParam(value="id", required=false) Long id,
		@RequestParam(value="depth", required=false) Integer depth,
		HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			SummaryWorkbook sw = new SummaryWorkbook();
			sw.set(id, depth);
			return AttachmentsUtils.prepareExcelResponse(sw.getWorkbook(), "summary.xlsx");
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getSummaryExcel", ex);
			return new ResponseEntity<String>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * Filters categories beans actions.
	 * 
	 * @param ui categories beans actions parameters wrapper
	 * @param request http request
	 * @param response http response
	 * @return list of filtered categories beans actions
	 */
	@RequestMapping(value = "/actions", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<List<CategoryBeanActionUI>> actions(
		@RequestBody CategoryBeanActionParamsUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (SiteModel.get(request).isAdmin())
			{
				List<CategoryBeanActionUI> ret = new ArrayList<>();
				CategoryBeanActionManager.getInstance().get(ui).forEach((bean)->{
					ret.add(new CategoryBeanActionUI(bean));
				});
				return SimpleResult.newSuccess(ret);
			}
			return SimpleResult.newFailure(ResponseMessage.Code.NO_RIGHTS, "Not an admin user");
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.actions", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
