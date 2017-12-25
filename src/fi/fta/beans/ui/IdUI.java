package fi.fta.beans.ui;

import fi.fta.beans.Identifiable;
import java.io.Serializable;

public class IdUI implements Serializable, Identifiable<Long>
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -6126675942538997907L;
	
	private Long id;
	
	
	public IdUI()
	{}
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
}
