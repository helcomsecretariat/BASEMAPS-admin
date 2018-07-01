package fi.fta.utils.parse.wfs;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.dom4j.Element;

import fi.fta.beans.Named;
import fi.fta.utils.Util;
import fi.fta.utils.parse.XmlBean;

public class FeatureType extends XmlBean<FeatureTypeSpecification> implements Named
{
	
	private String name;
	
	private String title;
	
	private String description;
	
	private List<String> keywords;
	
	private List<String> formats;
	
	private List<String> crs;
	
	private Float lowerLong;
	
	private Float lowerLat;
	
	private Float upperLong;
	
	private Float upperLat;

	private List<String> metadata;
	
	
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<String> getKeywords() {
		return keywords;
	}

	public void setKeywords(List<String> keywords) {
		this.keywords = keywords;
	}

	public List<String> getFormats() {
		return formats;
	}

	public void setFormats(List<String> formats) {
		this.formats = formats;
	}
	
	public List<String> getCrs() {
		return crs;
	}

	public void setCrs(List<String> crs) {
		this.crs = crs;
	}

	public Float getLowerLong() {
		return lowerLong;
	}

	public void setLowerLong(Float lowerLong) {
		this.lowerLong = lowerLong;
	}

	public Float getLowerLat() {
		return lowerLat;
	}

	public void setLowerLat(Float lowerLat) {
		this.lowerLat = lowerLat;
	}

	public Float getUpperLong() {
		return upperLong;
	}

	public void setUpperLong(Float upperLong) {
		this.upperLong = upperLong;
	}

	public Float getUpperLat() {
		return upperLat;
	}

	public void setUpperLat(Float upperLat) {
		this.upperLat = upperLat;
	}

	public List<String> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<String> metadata) {
		this.metadata = metadata;
	}

	public void fromElement(Element root, FeatureTypeSpecification specification)
	{
		name = root.elementText(specification.getName());
		title = root.elementText(specification.getTitle());
		description = root.elementText(specification.getAbstract());
		keywords = new ArrayList<>();
		for (Element fe : XmlBean.elements(root, specification.getPathKeywords()))
		{
			if (fe.getText() != null)
			{
				StringTokenizer tok = new StringTokenizer(fe.getText(), ",");
				while (tok.hasMoreTokens())
				{
					keywords.add(tok.nextToken().trim());
				}
			}
		}
		formats = new ArrayList<>();
		for (Element f : XmlBean.elements(root, specification.getPathOutputFormat()))
		{
			formats.add(f.getText());
		}
		crs = new ArrayList<>();
		String dcrs = root.elementText(specification.getDefaultCrs());
		if (!Util.isEmptyString(dcrs))
		{
			crs.add(dcrs);
		}
		for (Object c : root.elements(specification.getOtherCrs()))
		{
			crs.add(((Element)c).getText());
		}
		for (Object s : root.elements(specification.getOtherSrs()))
		{
			crs.add(((Element)s).getText());
		}
		String text = XmlBean.elementText(root, specification.getPathLowerCorner());
		if (!Util.isEmptyString(text))
		{
			String[] coords = text.split(" ");
			if (coords.length > 0)
			{
				lowerLong = Util.getFloat(coords[0], null);
			}
			if (coords.length > 1)
			{
				lowerLat = Util.getFloat(coords[1], null);
			}
		}
		text = XmlBean.elementText(root, specification.getPathUpperCorner());
		if (!Util.isEmptyString(text))
		{
			String[] coords = text.split(" ");
			if (coords.length > 0)
			{
				upperLong = Util.getFloat(coords[0], null);
			}
			if (coords.length > 1)
			{
				upperLat = Util.getFloat(coords[1], null);
			}
		}
		metadata = new ArrayList<>();
		Element md = root.element(specification.getMetadataUrl());
		if (md != null)
		{
			metadata.add(md.attributeValue("href"));
		}
	}
	
}
