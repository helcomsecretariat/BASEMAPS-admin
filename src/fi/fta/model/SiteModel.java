package fi.fta.model;

import java.util.Calendar;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hibernate.HibernateException;

import fi.fta.beans.User;
import fi.fta.beans.UserRole;
import fi.fta.beans.ui.UserUI;
import fi.fta.data.dao.UserDAO;
import fi.fta.utils.PasswordUtils;

public class SiteModel
{
	
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
	
	public boolean logged()
	{
		return user != null;
	}
	
	public boolean isAdmin()
	{
		return user != null && user.getRole().equals(UserRole.ADMIN);
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
