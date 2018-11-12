package fi.fta.beans;

import java.io.Serializable;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.SequenceGenerator;

import fi.fta.utils.Util;

/**
 * 
 * @author andrysta
 *
 * It is a superclass for all identifiable classes and contains id field of the class.
 */
@MappedSuperclass
public class IdBean implements Identifiable<Long>, Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -6025731030275364618L;
	
	/**
	 * Identification field
	 */
	@Id
	@SequenceGenerator(name="ID_GENERATOR", sequenceName="idgen", allocationSize=1)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="ID_GENERATOR")
	protected Long id;
	
	public IdBean()
	{}
	
	public IdBean(Long id)
	{
		this.setId(id);
	}
	
	public Long getId()
	{
		return id;
	}

	public void setId(Long id)
	{
		this.id = id;
	}
	
	public boolean saved()
	{
		return this.id != null;
	}
	
	@Override
    public int hashCode()
    {
    	return id == null ? super.hashCode() : id.hashCode();
    }
    
    @Override
    public boolean equals(Object o)
    {
    	return o != null && (o instanceof IdBean) && Util.equalsWithNull(this.id, ((IdBean)o).getId());
    }
    
    @Override
    public String toString()
    {
    	if (this.id != null)
    		return "[id : " + this.id.toString() + "] " + super.toString();
    	return super.toString();
    }
    
}
