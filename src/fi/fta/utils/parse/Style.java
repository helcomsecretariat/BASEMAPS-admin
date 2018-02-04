package fi.fta.utils.parse;

import java.util.ArrayList;
import java.util.List;

import org.dom4j.Element;

import fi.fta.beans.Named;

public class Style extends XmlBean<WMSStyleSpecification> implements Named
{
	
	private String name;
	
	private List<String> urls;
	
	
	public Style(Element root, WMSStyleSpecification specification)
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
	
	public void fromElement(Element root, WMSStyleSpecification specification)
	{
		this.setName(root.elementText(specification.getName()));
		this.setUrls(new ArrayList<>());
		for (Object o : root.elements(specification.getLegendURL()))
		{
			this.getUrls().add(((Element)o).element(specification.getOnlineResource()).attributeValue(specification.getHref()));
		}
	}
	
}
