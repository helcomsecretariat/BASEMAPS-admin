package fi.fta.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.Category;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.CategoryUI;
import fi.fta.beans.ui.TreeBranchUI;
import fi.fta.data.managers.CategoryManager;
import fi.fta.model.SiteModel;
import fi.fta.utils.BeansUtils;

@Controller
@RequestMapping("/categories")
public class CategoriesController
	extends CategoryBeansController<Category, CategoryUI, CategoryManager>
{
	
	public CategoriesController()
	{
		super(CategoryManager.getInstance());
	}
	
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
	
	@RequestMapping(value = "/tree", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<TreeBranchUI>> getTree(HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(
				BeansUtils.getLayerUIs(null, SiteModel.get(request)));
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getTree", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
