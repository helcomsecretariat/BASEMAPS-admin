package fi.fta.beans.ui;

import fi.fta.beans.UrlFacade;

public class IdentifiableUrlUI extends IdUI implements UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 341126051112726517L;

	private String url;
	
	
	public IdentifiableUrlUI()
	{}
	
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
}
