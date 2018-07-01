package fi.fta.utils.parse.wfs;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.dom4j.Element;

import fi.fta.utils.Util;
import fi.fta.utils.parse.XmlBean;

public class FeatureInfo extends XmlBean<FeatureInfoSpecification>
{
	
	private String provider;
	
	private String title;
	
	private List<String> keywords;
	
	private List<String> formats;
	
	private String description;
	
	private String fees;
	
	private String accessConstraints;

	private List<String> languages;
	
	private String metadataUrl;
	
	
	public FeatureInfo(Element root, FeatureInfoSpecification specification)
	{
		super(root, specification);
	}
	
	public String getProvider() {
		return provider;
	}

	public void setProvider(String provider) {
		this.provider = provider;
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

	public List<String> getFormats() {
		return formats;
	}

	public void setFormats(List<String> formats) {
		this.formats = formats;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getFees() {
		return fees;
	}

	public void setFees(String fees) {
		this.fees = fees;
	}

	public String getAccessConstraints() {
		return accessConstraints;
	}

	public void setAccessConstraints(String accessConstraints) {
		this.accessConstraints = accessConstraints;
	}

	public List<String> getLanguages() {
		return languages;
	}

	public void setLanguages(List<String> languages) {
		this.languages = languages;
	}

	public String getMetadataUrl() {
		return metadataUrl;
	}

	public void setMetadataUrl(String metadataUrl) {
		this.metadataUrl = metadataUrl;
	}

	@Override
	public void fromElement(Element root, FeatureInfoSpecification specification)
	{
		provider = XmlBean.elementText(root, specification.getPathProvider());
		Element sd = root.element(specification.getServiceIdentification());
		title = sd.elementText(specification.getTitle());
		keywords = new ArrayList<>();
		for (Element fe : XmlBean.elements(sd, specification.getPathKeywords()))
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
		description = sd.elementText(specification.getAbstract());
		fees = sd.elementText(specification.getFees());
		accessConstraints = sd.elementText(specification.getAccessConstraints());
		Element op = null;
		for (Element o : XmlBean.elements(root, specification.getPathOperation()))
		{
			if (o.attributeValue("name") == "GetFeature")
			{
				op = o;
				break;
			}
		}
		if (op != null)
		{
			for (Object o : op.elements(specification.getParameter()))
			{
				Element e = (Element)o;
				if (e.attributeValue("name") == "outputFormat")
				{
					formats = new ArrayList<>();
					for (Element f : XmlBean.elements(e, specification.getPathAllowedValue()))
					{
						formats.add(f.getText());
					}
					break;
				}
			}
		}
		Element ec = XmlBean.element(root, specification.getPathExtendedCapabilities());
		if (ec != null)
		{
			Element sl = ec.element(specification.getSupportedLanguages());
			if (sl != null)
			{
				languages = new ArrayList<>();
				String dl = XmlBean.elementText(sl, specification.getPathDefaultLanguage());
				if (!Util.isEmptyString(dl))
				{
					languages.add(dl);
				}
				for (Object l : sl.elements(specification.getSupportedLanguage()))
				{
					languages.add(((Element)l).elementText(specification.getLanguage()));
				}
			}
			String md = XmlBean.elementText(ec, specification.getPathExtendedMetadataUrl());
			if (!Util.isEmptyString(md))
			{
				metadataUrl = md;
			}
		}
			
	}
	
}
