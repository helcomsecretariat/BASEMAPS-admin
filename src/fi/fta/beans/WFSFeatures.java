package fi.fta.beans;

import java.util.List;

import fi.fta.utils.BeansUtils;
import fi.fta.utils.parse.wfs.FeatureInfo;
import fi.fta.utils.parse.wfs.FeatureType;
import fi.fta.utils.parse.wfs.Specification;

public class WFSFeatures
{

	private List<MetaData> metadata;
	
	private WFSInfo info;
	
	
	public WFSFeatures(Specification specification, FeatureInfo features, FeatureType type)
	{
		this.metadata = BeansUtils.getMetaData(null);
		this.info = new WFSInfo();	
		this.info.setVersion(specification.getVersion());
		this.info.setProvider(features.getProvider());
		this.info.setTitle(features.getTitle());
		this.info.setKeywords(features.getKeywords());
		this.info.setFormats(type.getFormats());
	}

	public List<MetaData> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaData> metadata) {
		this.metadata = metadata;
	}
	
	public WFSInfo getInfo() {
		return info;
	}

	public void setInfo(WFSInfo info) {
		this.info = info;
	}
	
}
