package fi.fta.beans;

import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import fi.fta.beans.ui.CategoryUI;

@Entity
@Table(name="categories")
public class Category extends CategoryBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -2920194411447223477L;
	
	@JsonIgnore
	@ManyToOne(targetEntity=Category.class, cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@JoinColumn(name = "parent")
	protected Category parent;
	
	@OneToMany(mappedBy = "parent", targetEntity=Category.class, cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@OrderBy("position")
	protected Set<Category> children;
	
	
	public Category()
	{}
	
	public Category(CategoryUI ui)
	{
		super(ui);
	}
	
	public Category getParent() {
		return parent;
	}

	public void setParent(Category parent) {
		this.parent = parent;
	}

	public Set<Category> getChildren() {
		return children;
	}

	public void setChildren(Set<Category> children) {
		this.children = children;
	}
	
}
