package fi.fta.beans;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import org.hibernate.annotations.Type;

import fi.fta.beans.ui.WMSStyleUI;
import fi.fta.utils.Util;
import fi.fta.utils.parse.Style;

@Entity
@Table(name="wmsstyles")
public class WMSStyle extends IdBean implements Named
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -119417370034651941L;
	
	@Column(updatable = false, insertable = false)
	private Long parent;
	
	private String name;
	
	@Column(columnDefinition="character varying(400)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> urls;
	
	private Boolean main;
	
	
	public WMSStyle()
	{}
	
	public WMSStyle(WMSStyleUI ui)
	{
		super(ui.getId());
		this.setParent(ui.getParent());
		this.setName(ui.getName());
		this.setUrls(ui.getUrls());
		this.setMain(ui.getMain());
	}
	
	public WMSStyle(Style s)
	{
		super();
		this.setName(s.getName());
		this.setUrls(s.getUrls());
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

	public List<String> getUrls() {
		return urls;
	}

	public void setUrls(List<String> urls) {
		this.urls = urls;
	}

	public Boolean getMain() {
		return main;
	}

	public void setMain(Boolean main) {
		this.main = main;
	}

	@Override
    public int hashCode()
    {
    	return name == null ? super.hashCode() : name.hashCode() +
    		7 * (id == null ? super.hashCode() : id.hashCode());
    }
	
	@Override
	public boolean equals(Object o)
	{
		boolean equals = o != null && (o instanceof WMSStyle);
		if (equals)
		{
			WMSStyle s = ((WMSStyle)o);
			equals = Util.equalsWithNull(this.name, s.getName()) &&
				(this.id == null || s.getId() == null || this.id.equals(s.getId())) &&
				(this.parent == null || s.getParent() == null || this.parent.equals(s.getParent()));
		}
		return equals;
			
	}
	
}
