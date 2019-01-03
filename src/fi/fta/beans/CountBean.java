package fi.fta.beans;

public class CountBean extends IdBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 3524882277024211621L;
	
	
	protected Integer count;
	
	public CountBean()
	{}
	
	public CountBean(Long id, Integer count)
	{
		super(id);
		this.setCount(count);
	}
	
	public CountBean(Long id, Long count)
	{
		this(id, count != null ? count.intValue() : null);
	}
	
	public Integer getCount() {
		return count;
	}

	public void setCount(Integer count) {
		this.count = count;
	}
	
}
