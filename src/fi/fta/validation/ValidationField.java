package fi.fta.validation;

import java.io.Serializable;

import fi.fta.beans.Named;

public class ValidationField implements Serializable, Named
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1379031511563884560L;
	
	private Integer index;
	private String name;
	private ValidationField parent;
	private ValidationField child;
	
	
	public ValidationField()
	{}
	
	public ValidationField(String name)
	{
		this();
		this.name = name;
	}
	
	public ValidationField(Integer index, String name)
	{
		this(name);
		this.index = index;
	}
	
	public Integer getIndex() {
		return index;
	}
	
	public void setIndex(Integer index) {
		this.index = index;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public ValidationField getParent() {
		return parent;
	}

	public void setParent(ValidationField parent) {
		this.parent = parent;
	}
	
	public ValidationField getChild() {
		return child;
	}
	
	public void setChild(ValidationField child) {
		this.child = child;
	}
	
}
