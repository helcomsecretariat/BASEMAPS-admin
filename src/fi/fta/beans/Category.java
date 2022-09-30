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

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import com.fasterxml.jackson.annotation.JsonIgnore;

import fi.fta.beans.ui.CategoryUI;
import fi.fta.beans.ui.MetaDataUI;
import fi.fta.utils.Util;

/**
 * 
 * It is the basic BASEMAPS tree structure part, has it's own label, parent, also contains children categories.
 * 
 * @author andrysta
 */

@Entity
@Table(name="categories")
public class Category extends CategoryBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -2920194411447223477L;
	
	/**
	 * Name of the category
	 */
	protected String label;
	
	/**
	 * URL to download from, if it is downloadable resource.
	 */
	@Column(name = "download_url")
	protected String downloadUrl;
	
	/**
	 * Link to other category by parent id - foreign key.
	 */
	@JsonIgnore
	@ManyToOne(targetEntity=Category.class, cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@JoinColumn(name = "parent")
	protected Category parent;
	
	/**
	 * Link to other categories, that has id of this category as their parent.
	 */
	@OneToMany(mappedBy = "parent", targetEntity=Category.class, cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@OrderBy("position")
	@Fetch(value = FetchMode.SUBSELECT)
	protected List<Category> children;
	
	/**
	 * Link to metadata instances, that has id of this category as their parent.
	 */
	@OneToMany(targetEntity=MetaData.class, cascade={CascadeType.ALL}, fetch=FetchType.EAGER)
	@JoinColumn(name = "parent", nullable = false, updatable = false, insertable = true)
	@OrderBy("id")
	protected Set<MetaData> metadata;
	
	/**
	 * Special Helcom metadata field, usually a URL
	 */
	@Column(name = "helcom_metadata")
	protected String helcomMetadata;
	
	protected String description;
	protected String tags;
	
	
	public Category()
	{}
	
	public Category(CategoryUI ui)
	{
		super(ui);
		this.setLabel(ui.getLabel());
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
		this.setHelcomMetadata(ui.getHelcomMetadata());
		this.setDescription(ui.getDescription());
		this.setTags(ui.getTags());
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getDownloadUrl() {
		return downloadUrl;
	}

	public void setDownloadUrl(String downloadUrl) {
		this.downloadUrl = downloadUrl;
	}
	
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getTags() {
		return tags;
	}

	public void setTags(String tags) {
		this.tags = tags;
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

	public String getHelcomMetadata() {
		return helcomMetadata;
	}

	public void setHelcomMetadata(String helcomMetadata) {
		this.helcomMetadata = helcomMetadata;
	}
	
}
