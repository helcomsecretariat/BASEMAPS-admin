package fi.fta.utils.parse.wms;

import java.util.ArrayList;
import java.util.List;

import org.dom4j.Element;

import fi.fta.beans.Named;
import fi.fta.utils.parse.XmlBean;

public class Style extends XmlBean<StyleSpecification> implements Named
{
	
	private String name;
	
	private List<String> urls;
	
	
	public Style(Element root, StyleSpecification specification)
	{
		super(root, specification);
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<String> getUrls() {
		return urls;
	}

	public void setUrls(List<String> urls) {
		this.urls = urls;
	}
	
	public void fromElement(Element root, StyleSpecification specification)
	{
		this.setName(root.elementText(specification.getName()));
		this.setUrls(new ArrayList<>());
		for (Object o : root.elements(specification.getLegendURL()))
		{
			this.getUrls().add(((Element)o).element(specification.getOnlineResource()).attributeValue(specification.getHref()));
		}
	}
	
}
