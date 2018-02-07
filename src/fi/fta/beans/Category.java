package fi.fta.beans;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import fi.fta.beans.ui.CategoryUI;
import fi.fta.beans.ui.MetaDataUI;
import fi.fta.utils.Util;

@Entity
@Table(name="categories")
public class Category extends CategoryBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -2920194411447223477L;
	
	protected String label;
	
	@Column(name = "helcom_metadata")
	protected String helcomMetadata;
	
	@Column(name = "download_url")
	protected String downloadUrl;
	
	@JsonIgnore
	@ManyToOne(targetEntity=Category.class, cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@JoinColumn(name = "parent")
	protected Category parent;
	
	@OneToMany(mappedBy = "parent", targetEntity=Category.class, cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@OrderBy("position")
	protected List<Category> children;
	
	@OneToMany(targetEntity=MetaData.class, cascade={CascadeType.ALL}, fetch=FetchType.EAGER)
	@JoinColumn(name = "parent", nullable = false, updatable = false, insertable = true)
	@OrderBy("id")
	protected Set<MetaData> metadata;
	
	
	public Category()
	{}
	
	public Category(CategoryUI ui)
	{
		super(ui);
		this.setLabel(ui.getLabel());
		this.setHelcomMetadata(ui.getHelcomMetadata());
		this.setDownloadUrl(ui.getDownloadUrl());
		this.setMetadata(new HashSet<>());
		if (!Util.isEmptyCollection(ui.getMetaData()))
		{
			for (MetaDataUI mdui : ui.getMetaData())
			{
				if (!Util.isEmptyString(mdui.getUrl()))
				{
					this.getMetadata().add(new MetaData(mdui));
				}
			}
		}
	}
	
	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getHelcomMetadata() {
		return helcomMetadata;
	}

	public void setHelcomMetadata(String helcomMetadata) {
		this.helcomMetadata = helcomMetadata;
	}

	public String getDownloadUrl() {
		return downloadUrl;
	}

	public void setDownloadUrl(String downloadUrl) {
		this.downloadUrl = downloadUrl;
	}

	public Category getParent() {
		return parent;
	}

	public void setParent(Category parent) {
		this.parent = parent;
	}

	public List<Category> getChildren() {
		return children;
	}

	public void setChildren(List<Category> children) {
		this.children = children;
	}

	public Set<MetaData> getMetadata() {
		return metadata;
	}

	public void setMetadata(Set<MetaData> metadata) {
		this.metadata = metadata;
	}
	
}
