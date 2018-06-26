package fi.fta.utils.parse.wms;

import java.util.ArrayList;
import java.util.List;

import org.dom4j.Element;

import fi.fta.utils.parse.XmlBean;

public class FeatureInfoFormatXmlType extends XmlBean<FeatureInfoFormatXmlTypeSpecification>
{
	
	protected String type;
	
	protected List<FeatureInfoFormatXml> features;
	
	
	public FeatureInfoFormatXmlType(Element root)
	{
		super(root, new FeatureInfoFormatXmlTypeSpecification());
		this.type = "FeatureCollection";
	}
	
	@Override
	public void fromElement(Element root, FeatureInfoFormatXmlTypeSpecification specification)
	{
		this.features = new ArrayList<>();
		this.features.add(new FeatureInfoFormatXml(
			root.element(specification.getFields()), specification));
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public List<FeatureInfoFormatXml> getFeatures() {
		return features;
	}

	public void setFeatures(List<FeatureInfoFormatXml> features) {
		this.features = features;
	}
	
}
