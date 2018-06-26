package fi.fta.utils.parse.wms;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.dom4j.Attribute;
import org.dom4j.Element;

import fi.fta.utils.parse.XmlBean;

public class FeatureInfoFormatXml extends XmlBean<FeatureInfoFormatXmlTypeSpecification>
{
	
	protected String type;
	
	protected List<String> geometry;
	
	protected Map<String, Object> properties;
	
	
	public FeatureInfoFormatXml(Element root, FeatureInfoFormatXmlTypeSpecification specification)
	{
		super(root, specification);
		this.type = "Feature";
		this.geometry = null;
	}
	
	@Override
	public void fromElement(Element root, FeatureInfoFormatXmlTypeSpecification specification)
	{
		this.properties = new HashMap<>();
		for (Object o : root.attributes())
		{
			Attribute a = (Attribute)o;
			this.properties.put(a.getName(), a.getValue());
		}
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public List<String> getGeometry() {
		return geometry;
	}

	public void setGeometry(List<String> geometry) {
		this.geometry = geometry;
	}

	public Map<String, Object> getProperties() {
		return properties;
	}

	public void setProperties(Map<String, Object> properties) {
		this.properties = properties;
	}
	
}
