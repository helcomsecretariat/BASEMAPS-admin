package fi.fta.beans.ui;

import java.io.Serializable;

public class CategoryCountsUI implements Serializable
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1650700517393867917L;
	
	
	private int wmses;
	
	private int wfses;
	
	private int arcgises;
	
	private int downloadables;
	
	
	public CategoryCountsUI()
	{
		this.wmses = 0;
		this.wfses = 0;
		this.arcgises = 0;
		this.downloadables = 0;
	}
	
	public CategoryCountsUI sum(CategoryCountsUI ui)
	{
		wmses += ui.getWmses();
		wfses += ui.getWfses();
		arcgises += ui.getArcgises();
		downloadables += ui.getDownloadables();
		return this;
	}
	
	public int getWmses() {
		return wmses;
	}

	public void setWmses(int wmses) {
		this.wmses = wmses;
	}

	public int getWfses() {
		return wfses;
	}

	public void setWfses(int wfses) {
		this.wfses = wfses;
	}

	public int getArcgises() {
		return arcgises;
	}

	public void setArcgises(int arcgises) {
		this.arcgises = arcgises;
	}

	public int getDownloadables() {
		return downloadables;
	}

	public void setDownloadables(int downloadables) {
		this.downloadables = downloadables;
	}
	
}
