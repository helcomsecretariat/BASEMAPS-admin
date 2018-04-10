package fi.fta.utils.parse.wms;

import java.util.ArrayList;
import java.util.List;

import org.dom4j.Element;

import fi.fta.utils.Util;
import fi.fta.utils.parse.XmlBean;

public class FeatureInfo extends XmlBean<FeatureInfoSpecification>
{
	
	private String organisation;
	
	private List<String> formats;
	
	private List<String> supportedLanguages;

	private String fees;
	
	private String accessConstraints;
	
	
	public FeatureInfo(Element root, FeatureInfoSpecification specification)
	{
		super(root, specification);
	}
	
	public String getOrganisation() {
		return organisation;
	}

	public void setOrganisation(String organisation) {
		this.organisation = organisation;
	}

	public List<String> getFormats() {
		return formats;
	}

	public void setFormats(List<String> formats) {
		this.formats = formats;
	}

	public List<String> getSupportedLanguages() {
		return supportedLanguages;
	}

	public void setSupportedLanguages(List<String> supportedLanguages) {
		this.supportedLanguages = supportedLanguages;
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

	@Override
	public void fromElement(Element root, FeatureInfoSpecification specification)
	{
		organisation = XmlBean.elementText(root, specification.getPathOrganisation());
		formats = new ArrayList<>();
		for (Element fe : XmlBean.elements(root, specification.getPathFormat()))
		{
			formats.add(fe.getText());
		}
		supportedLanguages = new ArrayList<>();
		Element le = XmlBean.element(root, specification.getPathSupportedLanguages());
		if (le != null)
		{
			String dl = XmlBean.elementText(le, specification.getPathDefaultLanguage());
			if (!Util.isEmptyString(dl))
			{
				supportedLanguages.add(dl);
			}
			for (Object o : le.elements(specification.getSupportedLanguage()))
			{
				String sl = ((Element)o).elementText(specification.getLanguage());
				if (!Util.isEmptyString(dl) && (dl == null || !dl.equalsIgnoreCase(sl)))
				{
					supportedLanguages.add(sl);
				}
			}
		}
		fees = XmlBean.elementText(root, specification.getPathFees());
		accessConstraints = XmlBean.elementText(root, specification.getPathAccessConstraints());
	}
	
}
