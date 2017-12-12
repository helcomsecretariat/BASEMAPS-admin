package fi.fta.beans;

public class NameBean extends IdBean implements Named
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -3482850049787308675L;
	
	protected String name;
	
	public NameBean()
	{
		super();
	}
	
	public NameBean(Long id, String name)
	{
		super(id);
		this.setName(name);
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
}
