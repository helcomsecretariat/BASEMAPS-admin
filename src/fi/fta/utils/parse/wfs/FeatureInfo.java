package fi.fta.utils.parse.wfs;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.dom4j.Element;

import fi.fta.utils.parse.XmlBean;

public class FeatureInfo extends XmlBean<FeatureInfoSpecification>
{
	
	private String provider;
	
	private String title;
	
	private List<String> keywords;
	
	
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

	@Override
	public void fromElement(Element root, FeatureInfoSpecification specification)
	{
		provider = XmlBean.elementText(root, specification.getPathProvider());
		title = XmlBean.elementText(root, specification.getPathServiceTitle());
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
	}
	
}
