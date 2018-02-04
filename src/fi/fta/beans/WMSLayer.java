package fi.fta.beans;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import fi.fta.utils.BeansUtils;
import fi.fta.utils.parse.FeatureInfo;
import fi.fta.utils.parse.Layer;
import fi.fta.utils.parse.WMSSpecification;

public class WMSLayer
{

	private List<MetaData> metadata;
	
	private WMSInfo info;
	
	
	public WMSLayer(WMSSpecification specification, FeatureInfo features, Layer l)
	{
		this.metadata = BeansUtils.getMetaData(l.getMetadata());
		this.info = new WMSInfo();	
		this.info.setVersion(specification.getVersion());
		this.info.setOrganisation(features.getOrganisation());
		this.info.setFormats(features.getFormats());
		this.info.setTitle(l.getTitle());
		this.info.setKeywords(l.getKeywords());
		this.info.setQueryable(l.getQueryable());
		this.info.setScaleMin(l.getScaleMin());
		this.info.setScaleMax(l.getScaleMax());
		this.info.setLanguages(features.getSupportedLanguages());
		this.info.setStyles(new HashSet<>(BeansUtils.getStyles(l.getStyles())));
		Set<String> crs = new TreeSet<>(l.getSrs());
		while (l.getParent() != null)
		{
			l = l.getParent();
			crs.addAll(l.getSrs());
		}
		this.info.setCrs(new ArrayList<>(crs));
	}

	public List<MetaData> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaData> metadata) {
		this.metadata = metadata;
	}
	
	public WMSInfo getInfo() {
		return info;
	}

	public void setInfo(WMSInfo info) {
		this.info = info;
	}
	
}
