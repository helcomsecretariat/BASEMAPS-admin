package fi.fta.beans.ui;

public class PasswordReminderUI extends EmailUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -8669240327868282731L;
	
	private String browser;
	
	
	public PasswordReminderUI()
	{}

	public String getBrowser() {
		return browser;
	}

	public void setBrowser(String browser) {
		this.browser = browser;
	}
	
}
