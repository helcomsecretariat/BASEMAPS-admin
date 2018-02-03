package fi.fta.beans;

import javax.persistence.DiscriminatorColumn;
import javax.persistence.Entity;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Table;

import fi.fta.beans.ui.LayerServiceUI;

@Entity
@Table(name="services")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type")
public class LayerService extends CategoryBean implements Named, UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7979482736565802655L;
	

	protected Long parent;
	
	protected String name;
	
	protected String url;
	
	
	public LayerService()
	{}
	
	public LayerService(LayerServiceUI ui)
	{
		super(ui);
		this.setParent(ui.getParent());
		this.setName(ui.getName());
		this.setUrl(ui.getUrl());
	}

	public Long getParent() {
		return parent;
	}

	public void setParent(Long parent) {
		this.parent = parent;
	}
	
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
	
}
