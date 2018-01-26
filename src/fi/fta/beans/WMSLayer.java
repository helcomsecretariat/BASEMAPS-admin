package fi.fta.beans;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.geotools.data.ows.Layer;
import org.geotools.data.ows.WMSCapabilities;
import org.geotools.data.wms.WebMapServer;

import fi.fta.utils.BeansUtils;

public class WMSLayer
{
	
	private Layer layer;
	
	private WMSInfo info;
	
	private List<MetaData> metadata;
	
	
	public WMSLayer(WebMapServer server, Layer l)
	{
		this.layer = l;
		this.metadata = BeansUtils.getMetaData(l.getMetadataURL());
		this.info = new WMSInfo();
		WMSCapabilities capabilities = server.getCapabilities();
		this.info.setVersion(capabilities.getVersion());
		this.info.setOrganisation(
			capabilities.getService().getContactInformation().getOrganisationName().toString());
		this.info.setFormats(capabilities.getRequest().getGetFeatureInfo().getFormats());
		this.info.setTitle(l.getTitle());
		this.info.setKeywords(l.getKeywords() != null ? Arrays.asList(l.getKeywords()) : new ArrayList<>());
		this.info.setQueryable(l.isQueryable());
		this.info.setScaleMin(l.getScaleDenominatorMin());
		this.info.setScaleMax(l.getScaleDenominatorMax());
		this.info.setStyles(new HashSet<>(BeansUtils.getStyles(l.getStyles())));
		Set<String> crs = new TreeSet<>(l.getSrs());
		while (l.getParent() != null)
		{
			l = l.getParent();
			crs.addAll(l.getSrs());
		}
		this.info.setCrs(new ArrayList<>(crs));
	}
	
	public Layer getLayer() {
		return layer;
	}

	public void setLayer(Layer layer) {
		this.layer = layer;
	}

	public WMSInfo getInfo() {
		return info;
	}

	public void setInfo(WMSInfo info) {
		this.info = info;
	}

	public List<MetaData> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaData> metadata) {
		this.metadata = metadata;
	}
	
}
