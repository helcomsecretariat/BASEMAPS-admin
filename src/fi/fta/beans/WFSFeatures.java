package fi.fta.beans;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import fi.fta.utils.BeansUtils;
import fi.fta.utils.Util;
import fi.fta.utils.parse.wfs.FeatureInfo;
import fi.fta.utils.parse.wfs.FeatureType;
import fi.fta.utils.parse.wfs.Specification;

public class WFSFeatures
{

	private List<MetaData> metadata;
	
	private WFSInfo info;
	
	
	public WFSFeatures(Specification specification, FeatureInfo features, FeatureType type)
	{
		List<fi.fta.utils.parse.wfs.MetaData> mds = new ArrayList<>();
		Set<String> urls = new HashSet<>();
		if (features.getMetadataUrl() != null)
		{
			mds.add(features.getMetadataUrl());
			urls.add(features.getMetadataUrl().getUrl());
		}
		if (type.getMetadata() != null)
		{
			for (fi.fta.utils.parse.wfs.MetaData md : type.getMetadata())
			{
				if (!urls.contains(md.getUrl()))
				{
					mds.add(md);
					urls.add(md.getUrl());
				}
			}
		}
		this.metadata = BeansUtils.getMetaData(mds, MetaDataSource.WFS);
		this.info = new WFSInfo();	
		this.info.setVersion(specification.getVersion());
		this.info.setOrganisation(features.getProvider());
		this.info.setTitle(type.getTitle());
		this.info.setKeywords(new ArrayList<>());
		if (features.getKeywords() != null)
		{
			this.info.getKeywords().addAll(features.getKeywords());
		}
		if (type.getKeywords() != null)
		{
			this.info.getKeywords().addAll(type.getKeywords());
		}
		this.info.setFormats(type.getFormats());
		if (Util.isEmptyCollection(this.info.getFormats()))
		{
			this.info.setFormats(features.getFormats());
		}
		this.info.setCrs(type.getCrs());
		this.info.setDescription(type.getDescription());
		if (Util.isEmptyString(this.info.getDescription()))
		{
			this.info.setDescription(features.getDescription());
		}
		this.info.setLowerLong(type.getLowerLong());
		this.info.setLowerLat(type.getLowerLat());
		this.info.setUpperLong(type.getUpperLong());
		this.info.setUpperLat(type.getUpperLat());
		this.info.setLanguages(features.getLanguages());
		this.info.setFees(features.getFees());
		this.info.setAccessConstraints(features.getAccessConstraints());
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
