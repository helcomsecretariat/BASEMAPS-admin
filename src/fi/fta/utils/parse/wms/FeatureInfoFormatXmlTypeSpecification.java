package fi.fta.utils.parse.wms;

import org.dom4j.Element;

public class FeatureInfoFormatXmlTypeSpecification
{
	
	public String getRootElement()
	{
		return "FeatureInfoResponse";
	}
	
	public String getFields()
	{
		return "FIELDS";
	}

	public static boolean isRootElement(Element e)
	{
		return new FeatureInfoFormatXmlTypeSpecification().getRootElement().equals(e.getName());
	}
	
}
