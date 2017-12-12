package fi.fta.beans;

public enum MailType
{
	
	HTML, PLAIN;
	
	public String getType()
	{
		return this.name().toLowerCase();
	}
	
	public String getContentType()
	{
		return "text/" + this.getType();
	}
	
}
