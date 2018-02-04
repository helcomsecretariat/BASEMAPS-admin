package fi.fta.utils.parse;

public interface WMSStyleSpecification extends OnlineResourceSpecification, NamedTitledSpecification
{
	
	public String getStyle();
	public String getLegendURL();
	
}
