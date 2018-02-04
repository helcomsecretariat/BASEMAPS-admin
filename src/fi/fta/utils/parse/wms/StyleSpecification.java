package fi.fta.utils.parse.wms;

import fi.fta.utils.parse.NamedTitledSpecification;
import fi.fta.utils.parse.OnlineResourceSpecification;

public interface StyleSpecification extends OnlineResourceSpecification, NamedTitledSpecification
{
	
	public String getStyle();
	public String getLegendURL();
	
}
