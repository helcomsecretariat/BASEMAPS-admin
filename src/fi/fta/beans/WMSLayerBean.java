package fi.fta.beans;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public class WMSLayerBean extends ServiceLayerBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -9120144310435460424L;
	

	private Boolean queryable;
	
	@Column(name = "scale_min")
	private Double scaleMin;
	
	@Column(name = "scale_max")
	private Double scaleMax;

	@Column(name = "bound_west")
	private Double boundWest;
	
	@Column(name = "bound_east")
	private Double boundEast;
	
	@Column(name = "bound_south")
	private Double boundSouth;
	
	@Column(name = "bound_north")
	private Double boundNorth;
	
	
	public WMSLayerBean()
	{}
	
	public WMSLayerBean(WMSLayerBean layer)
	{
		this();
		this.copy(layer);
	}
	
	public Boolean getQueryable() {
		return queryable;
	}

	public void setQueryable(Boolean queryable) {
		this.queryable = queryable;
	}

	public Double getScaleMin() {
		return scaleMin;
	}

	public void setScaleMin(Double scaleMin) {
		this.scaleMin = scaleMin;
	}

	public Double getScaleMax() {
		return scaleMax;
	}

	public void setScaleMax(Double scaleMax) {
		this.scaleMax = scaleMax;
	}

	public Double getBoundWest() {
		return boundWest;
	}

	public void setBoundWest(Double boundWest) {
		this.boundWest = boundWest;
	}

	public Double getBoundEast() {
		return boundEast;
	}

	public void setBoundEast(Double boundEast) {
		this.boundEast = boundEast;
	}

	public Double getBoundSouth() {
		return boundSouth;
	}

	public void setBoundSouth(Double boundSouth) {
		this.boundSouth = boundSouth;
	}

	public Double getBoundNorth() {
		return boundNorth;
	}

	public void setBoundNorth(Double boundNorth) {
		this.boundNorth = boundNorth;
	}

	public void copy(WMSLayerBean from)
	{
		super.copy(from);
		this.setQueryable(from.getQueryable());
		this.setScaleMin(from.getScaleMin());
		this.setScaleMax(from.getScaleMax());
		this.setBoundWest(from.getBoundWest());
		this.setBoundEast(from.getBoundEast());
		this.setBoundSouth(from.getBoundSouth());
		this.setBoundNorth(from.getBoundNorth());
		this.setLanguages(from.getLanguages());
	}
	
}
