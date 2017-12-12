package fi.fta.model;

import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import fi.fta.beans.User;

public class SiteUserModel
{
	
	protected static String MODEL_ATTRIBUTE = "fi.fta.model.SiteUserModel";
	
	
	protected UserModel umodel;
	
	protected String loginUrl;
	
	protected String ajaxLoginUrl;
	
	protected Locale locale;
	
	protected String previewLetter;
	
	
	public SiteUserModel(Locale locale)
	{
		this.locale = locale;
	}
	
	public Locale getLocale() {
		return locale;
	}

	public void setLocale(Locale locale) {
		this.locale = locale;
	}
	
	public void login(User user)
	{
		this.umodel = new UserModel(user);
	}
	
	public boolean logged()
	{
		return this.umodel != null;
	}
	
	public void logout()
	{
		if (umodel != null)
		{
			this.umodel.logout();
			this.umodel = null;
		}
		this.loginUrl = null;
	}
	
	public String getUserName()
	{
		return this.logged() ? this.umodel.getUserName() : "";
	}
	
	public void setLoginUrl(HttpServletRequest request)
	{
		this.loginUrl = this.url(request);
	}
	
	public String getLoginUrl()
	{
		return loginUrl;
	}
	
	public void setAJAXLoginUrl(HttpServletRequest request)
	{
		this.ajaxLoginUrl = this.url(request);
	}
	
	public String getAJAXLoginUrl()
	{
		return ajaxLoginUrl;
	}
	
	public String getPreviewLetter()
	{
		return previewLetter;
	}
	
	public void setPreviewLetter(String previewLetter)
	{
		this.previewLetter = previewLetter;
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
		
	private static void set(HttpSession session, SiteUserModel m)
	{
		session.setAttribute(SiteUserModel.MODEL_ATTRIBUTE, m);
	}

	private static SiteUserModel get(HttpSession session)
	{
		return (SiteUserModel)session.getAttribute(SiteUserModel.MODEL_ATTRIBUTE);
	}

	public static SiteUserModel get(HttpServletRequest request)
	{
		HttpSession session = request.getSession();
		SiteUserModel sum = SiteUserModel.get(session);
		if (sum == null)
		{
			sum = new SiteUserModel(request.getLocale());
			SiteUserModel.set(session, sum);
		}
		return sum;
	}
	
}
