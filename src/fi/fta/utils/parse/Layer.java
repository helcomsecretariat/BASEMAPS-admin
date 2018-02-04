package fi.fta.utils.parse;

import java.util.ArrayList;
import java.util.List;

import org.dom4j.Element;

import fi.fta.beans.Named;

public class Layer extends XmlBean<WMSLayerSpecification> implements Named
{
	
	private Boolean queryable;
	
	private String name;
	
	private String title;
	
	private List<String> keywords;
	
	private List<String> srs;
	
	private Double scaleMin;
	
	private Double scaleMax;
	
	private List<Style> styles;
	
	private List<MetaData> metadata;
	
	private Layer parent;
	
	private List<Layer> layers;
	

	public Layer(Element root, WMSLayerSpecification specification)
	{
		super(root, specification);
	}
	
	public Layer(Layer parent, Element root, WMSLayerSpecification specification)
	{
		super();
		this.fromElement(parent, root, specification);
	}
	
	public Boolean getQueryable() {
		return queryable;
	}

	public void setQueryable(Boolean queryable) {
		this.queryable = queryable;
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

	public List<String> getKeywords() {
		return keywords;
	}

	public void setKeywords(List<String> keywords) {
		this.keywords = keywords;
	}

	public List<String> getSrs() {
		return srs;
	}

	public void setSrs(List<String> srs) {
		this.srs = srs;
	}

	public Double getScaleMin() {
		return scaleMin;
	}

	public void setScaleMin(Double scaleMin) {
		this.scaleMin = scaleMin;
	}

	public Double getScaleMax() {
		return scaleMax;
	}

	public void setScaleMax(Double scaleMax) {
		this.scaleMax = scaleMax;
	}

	public List<Style> getStyles() {
		return styles;
	}

	public void setStyles(List<Style> styles) {
		this.styles = styles;
	}

	public List<MetaData> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaData> metadata) {
		this.metadata = metadata;
	}

	public List<Layer> getLayers() {
		return layers;
	}

	public Layer getParent() {
		return parent;
	}

	public void setParent(Layer parent) {
		this.parent = parent;
	}

	public void setLayers(List<Layer> layers) {
		this.layers = layers;
	}
	
	public void fromElement(Element root, WMSLayerSpecification specification)
	{
		Element le = XmlBean.element(root, specification.getPathLayer());
		this.set(le, specification);
		this.setLayers(new ArrayList<>());
		for (Object o : le.elements(specification.getLayer()))
		{
			this.getLayers().add(new Layer(this, (Element)o, specification));
		}
	}
	
	public void fromElement(Layer parent, Element root, WMSLayerSpecification specification)
	{
		this.setParent(parent);
		this.set(root, specification);
		this.setLayers(new ArrayList<>());
		for (Object o : root.elements(specification.getLayer()))
		{
			this.getLayers().add(new Layer(this, (Element)o, specification));
		}
	}
	
	private void set(Element e, WMSLayerSpecification specification)
	{
		String av = e.attributeValue(specification.getQueryable());
		this.setQueryable(av != null && av.equals("1"));
		this.setName(e.elementText(specification.getName()));
		this.setTitle(e.elementText(specification.getTitle()));
		List<String> keywords = new ArrayList<>();
		for (Element ke : XmlBean.elements(e, specification.getPathKeywords()))
		{
			keywords.add(ke.getText());
		}
		this.setKeywords(keywords);
		List<String> srses = new ArrayList<>();
		for (Object o : e.elements(specification.getSrs()))
		{
			srses.add(((Element)o).getText());
		}
		this.setSrs(srses);
		this.setMetadata(new ArrayList<>());
		for (Object o : e.elements(specification.getMetaDataURL()))
		{
			this.getMetadata().add(new MetaData((Element)o, specification));
		}
		this.setStyles(new ArrayList<>());
		for (Object o : e.elements(specification.getStyle()))
		{
			this.getStyles().add(new Style((Element)o, specification));
		}
	}
	
}
