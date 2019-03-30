package fi.fta.controllers;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.hibernate.HibernateException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.Pair;
import fi.fta.beans.PasswordResetToken;
import fi.fta.beans.User;
import fi.fta.beans.UserRight;
import fi.fta.beans.UserRole;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.ChangePasswordUI;
import fi.fta.beans.ui.PasswordReminderUI;
import fi.fta.beans.ui.PasswordResetTokenUI;
import fi.fta.beans.ui.TokenFinishUI;
import fi.fta.beans.ui.UserRightUI;
import fi.fta.beans.ui.UserUI;
import fi.fta.data.managers.PasswordResetTokenManager;
import fi.fta.data.managers.UserManager;
import fi.fta.model.SiteModel;
import fi.fta.utils.MailUtils;
import fi.fta.utils.PasswordUtils;
import fi.fta.utils.Util;
import fi.fta.validation.ChangePasswordValidator;
import fi.fta.validation.ClassStructureAssessor;
import fi.fta.validation.UserPasswordResetValidator;
import fi.fta.validation.ValidationMessage;

/**
 * Controller for user management operations, some are related to administrator actions,
 * others might be used for particular user.
 * 
 * @author andrysta
 *
 */
@Controller
@RequestMapping("/users")
public class UsersController
{
	
	private static Logger logger = Logger.getLogger(UsersController.class);
	
	/**
	 * List all user with a requested role. Available for ADMIN users only.
	 * 
	 * @param role user role, like administrator or data provider
	 * @param request http request
	 * @param response http response
	 * @return list of wrapped user objects
	 */
	@RequestMapping(value = "/list/{role}", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<UserUI>> list(
		@PathVariable("role") UserRole role, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (SiteModel.get(request).isAdmin())
			{
				List<UserUI> uis = new ArrayList<>();
				for (User u : UserManager.getInstance().getByRole(role))
				{
					uis.add(new UserUI(u));
				}
				return SimpleResult.newSuccess(uis);
			}
			else
			{
				return SimpleResult.noRightsFailure();
			}
		}
		catch (Exception ex)
		{
			logger.error("UsersController.list(" + role + ")", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Add newly created user to the database. Available for ADMIN users only.
	 * 
	 * @param ui newly created user
	 * @param request http request
	 * @param response http response
	 * @return user ID in the database
	 */
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
			if (SiteModel.get(request).isAdmin())
			{
				return SimpleResult.newSuccess(UserManager.getInstance().add(ui));
			}
			else
			{
				return SimpleResult.noRightsFailure();
			}
		}
		catch (Exception ex)
		{
			logger.error("UsersController.add", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Add right for user. Available for ADMIN users only.
	 * 
	 * @param ui user right
	 * @param request http request
	 * @param response http response
	 * @return success or error message
	 */
	@RequestMapping(value = "/add-right", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage addRight(
		@RequestBody UserRightUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			List<ValidationMessage> validations = ClassStructureAssessor.getInstance().validate(ui);
			if (!validations.isEmpty())
			{
				return SimpleMessage.newFailure(
					ResponseMessage.Code.ERROR_VALIDATION, "Invalid user right", validations);
			}
			SiteModel m = SiteModel.get(request);
			if (m.isAdmin())
			{
				m.addRight(ui);
				return SimpleMessage.newSuccess();
			}
			else
			{
				return SimpleMessage.noRightsFailure();
			}
		}
		catch (Exception ex)
		{
			logger.error("UsersController.addRight", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Update user from front-end (user input). Current user can update information about himself/herself,
	 * however cannot alter any rights.
	 * Only ADMIN users can update rights of current user or other users.
	 * 
	 * @param ui user object from user input
	 * @param request http request
	 * @param response http response
	 * @return success or error message
	 */
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage update(
		@RequestBody UserUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			List<ValidationMessage> validations = ClassStructureAssessor.getInstance().validate(ui);
			if (!validations.isEmpty() &&
				(validations.size() != 1 || !validations.get(0).getField().getName().equals("password")))
			{
				return SimpleMessage.newFailure(
					ResponseMessage.Code.ERROR_VALIDATION, "Invalid user", validations);
			}
			SiteModel m = SiteModel.get(request);
			if (m.isAdmin() || m.isCurent(ui.getId()))
			{
				if (!m.isAdmin())
				{
					// user itself cannot update its rights
					ui.setRights(new ArrayList<>());
					for (UserRight ur : m.getUserRights())
					{
						ui.getRights().add(new UserRightUI(ur));
					}
				}
				m.update(ui);
				return SimpleMessage.newSuccess();
			}
			else
			{
				return SimpleMessage.noRightsFailure();
			}
		}
		catch (Exception ex)
		{
			logger.error("UsersController.update", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Delete user from database. Available only for ADMIN users.
	 * 
	 * @param id user ID in the database
	 * @param request http request
	 * @param response http response
	 * @return success or error message
	 */
	@RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
	@ResponseBody
	public SimpleMessage delete(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (SiteModel.get(request).isAdmin())
			{
				UserManager.getInstance().delete(id);
				return SimpleMessage.newSuccess();
			}
			else
			{
				return SimpleMessage.noRightsFailure();
			}
		}
		catch (Exception ex)
		{
			logger.error("UsersController.delete", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Retrieves information of user, currently logged in the session.
	 * 
	 * @param request http request
	 * @param response http response
	 * @return wrapper of user object
	 */
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
	
	/**
	 * Inputs and saves new password for the current user.
	 * 
	 * @param ui object wrapper for changing password containing new and old passwords
	 * @param request http request
	 * @param response http response
	 * @return success or error message
	 */
	@RequestMapping(value = "/change-password", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage changePassword(
		@RequestBody ChangePasswordUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			SiteModel m = SiteModel.get(request);
			List<ValidationMessage> validations = new ChangePasswordValidator(m).validate(ui);
			if (validations.isEmpty())
			{
				m.changePassword(ui.getNewPassword());
				return SimpleMessage.newSuccess();
			}
			return SimpleMessage.newFailure(
				ResponseMessage.Code.ERROR_VALIDATION, "Invalid change password", validations);
		}
		catch (Exception ex)
		{
			logger.error("UsersController.changePassword", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Reminds password for email that is in database and belongs to a user.
	 * 
	 * @param ui email with browser wrapper
	 * @param request http request
	 * @param response http response
	 * @return true, when user was found and token created, false - otherwise
	 */
	@RequestMapping(value = "/remind", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<Boolean> remind(
		@RequestBody PasswordReminderUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			List<ValidationMessage> validations = ClassStructureAssessor.getInstance().validate(ui);
			if (validations.isEmpty())
			{
				User u = UserManager.getInstance().getByEmail(ui.getEmail());
				if (u != null)
				{
					PasswordResetToken token = PasswordResetTokenManager.getInstance().add(
						u.getId(), ui.getBrowser(), request.getRemoteAddr());
					MailUtils.remind(u, token);
					return SimpleResult.newSuccess(true);
				}
				return SimpleResult.newSuccess(false);
			}
			return SimpleResult.newFailure(
				ResponseMessage.Code.ERROR_VALIDATION, "Invalid email", validations);
		}
		catch (Exception ex)
		{
			logger.error("UsersController.remind", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Retrieves password reset token by key. Can finish immediately when token is present and valid.
	 * 
	 * @param ui key wrapper for password reset token
	 * @param request http request
	 * @param response http response
	 * @return wrapper of password reset token object
	 */
	@RequestMapping(value = "/retrieve-password-token", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<PasswordResetTokenUI> retrievePasswordToken(
		@RequestBody TokenFinishUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (!Util.isEmptyString(ui.getKey()))
			{
				Pair<Long, String> tid = PasswordUtils.decodeKey(ui.getKey());
				if (tid.getFirst() != null)
				{
					PasswordResetToken token = PasswordResetTokenManager.getInstance().get(tid.getFirst());
					if (token != null && PasswordUtils.validate(tid.getSecond(), token))
					{
						if (token.valid() && ui.getFinish() != null)
						{
							PasswordResetTokenManager.getInstance().finish(
								token.getId(), ui.getFinish().booleanValue());
						}
						return SimpleResult.newSuccess(new PasswordResetTokenUI(token));
					}
				}
			}
			return SimpleResult.newFailure(ResponseMessage.Code.NOT_FOUND, "Password reset token not found or not valid");
		}
		catch (Exception ex)
		{
		    logger.error("UsersController.retrievePasswordToken", ex);
		    return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Resets user password by password reset token.
	 * 
	 * @param ui a wrapper for password reset token with new password
	 * @param request http request
	 * @param response http response
	 * @return wrapper of object, that defines whether the password was changed successfully
	 */
	@RequestMapping(value = "/reset-password-token", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<Boolean> resetPasswordToken(
		@RequestBody PasswordResetTokenUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			PasswordResetToken token = PasswordResetTokenManager.getInstance().get(ui.getId());
			List<ValidationMessage> validations = new UserPasswordResetValidator(token).validate(ui);
			if (validations.isEmpty())
			{
				if (token.valid())
				{
					User u = UserManager.getInstance().get(token.getUserId());
					u.setPassword(PasswordUtils.encode(ui.getNewPassword()));
					UserManager.getInstance().update(u);
					try
					{
						token.setFinished(true);
						PasswordResetTokenManager.getInstance().finish(token.getId(), true);
					}
					catch (HibernateException ex)
					{
						logger.error("UsersController.resetPassword", ex);
					}
					return SimpleResult.newSuccess(true);
				}
				return SimpleResult.newSuccess(false);
			}
			else
			{
				return SimpleResult.newFailure(
					ResponseMessage.Code.ERROR_VALIDATION, "Password reset check failures", validations);
			}
		}
		catch (Exception ex)
		{
		    logger.error("UsersController.resetPassword", ex);
		    return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
