package fi.fta.model;

import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.function.BiFunction;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.RightType;
import fi.fta.beans.User;
import fi.fta.beans.UserRight;
import fi.fta.beans.UserRole;
import fi.fta.beans.ui.UserRightUI;
import fi.fta.beans.ui.UserUI;
import fi.fta.data.dao.UserDAO;
import fi.fta.data.managers.CategoryManager;
import fi.fta.data.managers.UserManager;
import fi.fta.utils.PasswordUtils;
import fi.fta.utils.Util;

public class SiteModel
{
	
	protected static Logger logger = Logger.getLogger(SiteModel.class);
	
	protected static String MODEL_ATTRIBUTE = "fi.fta.model.SiteModel";
	
	
	protected User user;
	
	protected String loginUrl;
	
	protected Locale locale;
	
	
	public SiteModel(Locale locale)
	{
		this.locale = locale;
	}
	
	public Locale getLocale() {
		return locale;
	}

	public void setLocale(Locale locale) {
		this.locale = locale;
	}
	
	public void login(User user) throws HibernateException
	{
		user.setLastLogin(Calendar.getInstance().getTime());
		user.setLoginCount(user.getLoginCount() != null ? (user.getLoginCount() + 1) : 1);
		this.user = new UserDAO().update(user);
	}
	
	public User update(UserUI ui) throws HibernateException
	{
		User u = UserManager.getInstance().update(ui);
		if (this.isCurent(u.getId()))
		{
			user = u;
		}
		return u;
	}
	
	public User addRight(UserRightUI ui)
	{
		User u = UserManager.getInstance().add(ui);
		if (u != null && this.isCurent(u.getId()))
		{
			user = u;
		}
		return u;
	}
	
	public boolean logged()
	{
		return user != null;
	}
	
	public boolean isAdmin()
	{
		return user != null && user.getRole().equals(UserRole.ADMIN);
	}
	
	public boolean isCurent(Long userId)
	{
		return user != null && userId != null && user.getId().equals(userId);
	}
	
	public void logout()
	{
		user = null;
		loginUrl = null;
	}
	
	public String getUserName()
	{
		return this.logged() ? user.getName() : "";
	}
	
	public String getUserEmail()
	{
		return this.logged() ? user.getEmail() : "";
	}
	
	public List<UserRight> getUserRights()
	{
		return this.logged() ? user.getRights() : Collections.emptyList();
	}
	
	public boolean checkPassword(String password)
	{
		return this.logged() &&
			user.getPassword().equals(PasswordUtils.encode(password));
	}
	
	public boolean changePassword(String password) throws HibernateException
	{
		if (this.logged())
		{
			user.setPassword(PasswordUtils.encode(password));
			new UserDAO().update(user);
			return true;
		}
		return false;
	}
	
	public void setLoginUrl(HttpServletRequest request)
	{
		loginUrl = this.url(request);
	}
	
	public String getLoginUrl()
	{
		return loginUrl;
	}
	
	public UserUI getUserUI()
	{
		if (this.logged())
		{
			return new UserUI(user);
		}
		return new UserUI();
	}
	
	private String url(HttpServletRequest request)
	{
		String url = request.getServletPath();
		if (request.getQueryString() != null)
		{
			url += "?" + request.getQueryString();
		}
		return url;
	}
	
	public boolean canRead(Long categoryId)
	{
		return this.can(categoryId, RightType.r, SiteModel::hasRightForCategory);
	}
	
	public boolean canWrite(Long categoryId)
	{
		return this.can(categoryId, RightType.w, SiteModel::hasRightForCategory);
	}
	
	public boolean canReadThis(Long categoryId)
	{
		return this.can(categoryId, RightType.r, Util::equalsWithNull);
	}
	
	public boolean canWriteThis(Long categoryId)
	{
		return this.can(categoryId, RightType.w, Util::equalsWithNull);
	}
	
	private boolean can(Long categoryId, RightType r, BiFunction<Long, Long, Boolean> check)
	{
		if (this.logged() && !Util.isEmptyCollection(user.getRights()))
		{
			for (UserRight ur : user.getRights())
			{
				if (ur.getRights().contains(r) && check.apply(ur.getCategoryId(), categoryId))
				{
					return true;
				}
			}
		}
		return false;
	}
	
	
	private static boolean hasRightForCategory(Long rightCategoryId, Long categoryId)
	{
		if (rightCategoryId == null ||
			categoryId != null && rightCategoryId.equals(categoryId))
		{
			return true;
		}
		else if (categoryId != null)
		{
			try
			{
				Category c = CategoryManager.getInstance().getParent(categoryId);
				while (c != null)
				{
					if (rightCategoryId.equals(c.getId()))
					{
						return true;
					}
					c = c.getParent();
				}
			}
			catch (HibernateException ex)
			{
				logger.error("SiteModel.hasRightForCategory(" + rightCategoryId + ", " + categoryId, ex);
			}
		}
		return false;
	}
	
	private static void set(HttpSession session, SiteModel m)
	{
		session.setAttribute(SiteModel.MODEL_ATTRIBUTE, m);
	}

	private static SiteModel get(HttpSession session)
	{
		return (SiteModel)session.getAttribute(SiteModel.MODEL_ATTRIBUTE);
	}

	public static SiteModel get(HttpServletRequest request)
	{
		HttpSession session = request.getSession();
		SiteModel sm = SiteModel.get(session);
		if (sm == null)
		{
			sm = new SiteModel(request.getLocale());
			SiteModel.set(session, sm);
		}
		return sm;
	}
	
}
