package fi.fta.controllers;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.User;
import fi.fta.beans.UserRole;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.UserUI;
import fi.fta.data.managers.UserManager;
import fi.fta.model.SiteModel;
import fi.fta.validation.ClassStructureAssessor;
import fi.fta.validation.ValidationMessage;

@Controller
@RequestMapping("/users")
public class UsersController
{
	
	private static Logger logger = Logger.getLogger(UsersController.class);
	
	@RequestMapping(value = "/list/{role}", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<UserUI>> list(
		@PathVariable("role") UserRole role, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			List<UserUI> uis = new ArrayList<>();
			for (User u : UserManager.getInstance().getByRole(role))
			{
				uis.add(new UserUI(u));
			}
			return SimpleResult.newSuccess(uis);
		}
		catch (Exception ex)
		{
			logger.error("UsersController.list(" + role + ")", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<Long> add(
		@RequestBody UserUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			List<ValidationMessage> validations = ClassStructureAssessor.getInstance().validate(ui);
			if (!validations.isEmpty())
			{
				return SimpleResult.newFailure(
					ResponseMessage.Code.ERROR_VALIDATION, "Invalid user", validations);
			}
			return SimpleResult.newSuccess(UserManager.getInstance().add(ui));
		}
		catch (Exception ex)
		{
			logger.error("UsersController.add", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
	@ResponseBody
	public SimpleMessage delete(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			UserManager.getInstance().delete(id);
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error("UsersController.delete", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/current", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<UserUI> current(HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(SiteModel.get(request).getUserUI());
		}
		catch (Exception ex)
		{
			logger.error("UsersController.current", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
