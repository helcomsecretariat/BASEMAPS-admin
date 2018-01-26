package fi.fta.beans;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Table;

import org.geotools.data.wms.xml.MetadataURL;

import fi.fta.beans.ui.MetaDataUI;
import fi.fta.utils.Util;

@Entity
@Table(name="metadata")
public class MetaData extends IdBean implements UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -5713490708071086143L;
	
	
	@Column(updatable = false, insertable = false)
	public Long parent;
	
	@Enumerated(EnumType.STRING)
	public MetaDataFormat format;
	
	public String url;
	
	@Enumerated(EnumType.STRING)
	public MetaDataSource source;
	
	
	public MetaData()
	{}
	
	public MetaData(MetaDataUI ui)
	{
		super(ui.getId());
		this.setParent(ui.getParent());
		this.setFormat(ui.getFormat());
		this.setUrl(ui.getUrl());
		this.setSource(ui.getSource());
	}
	
	public MetaData(MetadataURL mdu)
	{
		super();
		this.setFormat(MetaDataFormat.fromString(mdu.getFormat()));
		this.setUrl(mdu.getUrl().toString());
		this.setSource(MetaDataSource.WMS);
	}
	
	public Long getParent() {
		return parent;
	}

	public void setParent(Long parent) {
		this.parent = parent;
	}

	public MetaDataFormat getFormat() {
		return format;
	}

	public void setFormat(MetaDataFormat format) {
		this.format = format;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public MetaDataSource getSource() {
		return source;
	}

	public void setSource(MetaDataSource source) {
		this.source = source;
	}
	
	@Override
    public int hashCode()
    {
    	return format == null ? super.hashCode() : format.hashCode() +
    		7 * (url == null ? super.hashCode() : url.hashCode());
    }
	
	@Override
	public boolean equals(Object o)
	{
		boolean equals = o != null && (o instanceof MetaData);
		if (equals)
		{
			MetaData md = ((MetaData)o);
			equals = Util.equalsWithNull(this.format, md.getFormat()) &&
				Util.equalsWithNull(this.url, md.getUrl()) &&
				(this.id == null || md.getId() == null || this.id.equals(md.getId())) &&
				(this.parent == null || md.getParent() == null || this.parent.equals(md.getParent()));
		}
		return equals;
	}
	
}
