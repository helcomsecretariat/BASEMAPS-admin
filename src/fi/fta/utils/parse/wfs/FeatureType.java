package fi.fta.utils.parse.wfs;

import java.util.ArrayList;
import java.util.List;

import org.dom4j.Element;

import fi.fta.beans.Named;
import fi.fta.utils.parse.XmlBean;

public class FeatureType extends XmlBean<FeatureTypeSpecification> implements Named
{
	
	private String name;
	
	private String title;
	
	private List<String> formats;
	
	
	public FeatureType(Element root, FeatureTypeSpecification specification)
	{
		super();
		this.fromElement(root, specification);
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public List<String> getFormats() {
		return formats;
	}

	public void setFormats(List<String> formats) {
		this.formats = formats;
	}
	
	public void fromElement(Element root, FeatureTypeSpecification specification)
	{
		this.name = root.elementText(specification.getName());
		this.title = root.elementText(specification.getTitle());
		this.formats = new ArrayList<>();
		for (Element f : XmlBean.elements(root, specification.getPathOutputFormat()))
		{
			this.formats.add(f.getText());
		}
	}
	
}
