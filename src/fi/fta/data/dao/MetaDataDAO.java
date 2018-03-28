package fi.fta.data.dao;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.MetaData;

public class MetaDataDAO extends SimpleIdTableDAO<MetaData>
{
	
	public MetaDataDAO()
	{
		super(MetaData.class);
	}
	
	public List<MetaData> getByParent(Long id) throws HibernateException
	{
		return super.getByField("parent", id);
	}
	
}
