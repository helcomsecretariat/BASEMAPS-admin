package fi.fta.beans.ui;

import java.io.Serializable;

public class TokenFinishUI implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 3223963339174836781L;

	private String key;
	
	private Boolean finish;
	
	
	public TokenFinishUI()
	{}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public Boolean getFinish() {
		return finish;
	}

	public void setFinish(Boolean finish) {
		this.finish = finish;
	}
	
}
