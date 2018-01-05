package fi.fta.beans.ui;

public class WMSUI extends CategoryUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -968759793549553472L;
	

	protected String name;
	
	protected String url;
	
	protected String metaDataUrl;
	
	protected String view;
	
	protected String download;
	
	protected String catalogueMetaId;
	
	
	public WMSUI()
	{}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getMetaDataUrl() {
		return metaDataUrl;
	}

	public void setMetaDataUrl(String metaDataUrl) {
		this.metaDataUrl = metaDataUrl;
	}

	public String getView() {
		return view;
	}

	public void setView(String view) {
		this.view = view;
	}

	public String getDownload() {
		return download;
	}

	public void setDownload(String download) {
		this.download = download;
	}

	public String getCatalogueMetaId() {
		return catalogueMetaId;
	}

	public void setCatalogueMetaId(String catalogueMetaId) {
		this.catalogueMetaId = catalogueMetaId;
	}
	
}
