package fi.fta.beans;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public class WFSLayerBean extends ServiceLayerBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 630424770539931892L;
	
	
	@Column(name = "lower_long")
	protected Float lowerLong;
	
	@Column(name = "lower_lat")
	protected Float lowerLat;
	
	@Column(name = "upper_long")
	protected Float upperLong;
	
	@Column(name = "upper_lat")
	protected Float upperLat;
	
	
	public WFSLayerBean()
	{}
	
	public Float getLowerLong() {
		return lowerLong;
	}

	public void setLowerLong(Float lowerLong) {
		this.lowerLong = lowerLong;
	}

	public Float getLowerLat() {
		return lowerLat;
	}

	public void setLowerLat(Float lowerLat) {
		this.lowerLat = lowerLat;
	}

	public Float getUpperLong() {
		return upperLong;
	}

	public void setUpperLong(Float upperLong) {
		this.upperLong = upperLong;
	}

	public Float getUpperLat() {
		return upperLat;
	}

	public void setUpperLat(Float upperLat) {
		this.upperLat = upperLat;
	}

	public WFSLayerBean(WFSLayerBean layer)
	{
		this();
		this.copy(layer);
	}
	
	public void copy(WFSLayerBean from)
	{
		super.copy(from);
		this.setLowerLong(from.getLowerLong());
		this.setLowerLat(from.getLowerLat());
		this.setUpperLong(from.getUpperLong());
		this.setUpperLat(from.getUpperLat());
	}
	
}
