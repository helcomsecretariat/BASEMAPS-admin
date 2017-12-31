package fi.fta.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.LoginUI;
import fi.fta.beans.ui.UserUI;
import fi.fta.model.SiteModel;
import fi.fta.validation.LoginValidator;
import fi.fta.validation.ValidationMessage;

@Controller
public class LoginController
{
	
	private static Logger logger = Logger.getLogger(LoginController.class);
	
	@RequestMapping(value = "/login", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<UserUI> login(
		@RequestBody LoginUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			SiteModel model = SiteModel.get(request);
			LoginValidator validator = new LoginValidator(model);
			List<ValidationMessage> validations = validator.validate(ui);
			if (!validations.isEmpty())
			{
				return SimpleResult.newFailure(
					ResponseMessage.Code.ERROR_VALIDATION, "Invalid login", validations);
			}
			if (model.logged())
			{
				return SimpleResult.newSuccess(model.getUserUI());
			}
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, "User not found");
		}
		catch (Exception ex)
		{
			logger.error("LoginController.login", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/logout", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage logout(HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			SiteModel model = SiteModel.get(request);
			if (model.logged())
			{
				model.logout();
			}
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error("LoginController.logout", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
