package fi.fta.beans.ui;

import java.io.Serializable;

import fi.fta.beans.Identifiable;

public class IdUI implements Serializable, Identifiable<Long>
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -6126675942538997907L;
	
	private Long id;
	
	
	public IdUI()
	{}
	
	public IdUI(Identifiable<Long> bean)
	{
		this.setId(bean.getId());
	}
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
}
