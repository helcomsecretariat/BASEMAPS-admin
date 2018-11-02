package fi.fta.beans.ui;

import java.io.Serializable;

public class UrlFormatUI implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -6126675942538997907L;
	
	private String url;
	private String format;
	
	
	public UrlFormatUI()
	{}
		
	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getFormat() {
		return format;
	}

	public void setFormat(String format) {
		this.format = format;
	}
	
}
