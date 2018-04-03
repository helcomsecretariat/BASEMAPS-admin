package fi.fta.data.dao;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import fi.fta.utils.Util;

public class PersistentStringListType implements UserType
{
	
	@Override
	public int[] sqlTypes()
	{
	    return new int[] {Types.VARCHAR};
	}
	
	@SuppressWarnings("rawtypes")
	@Override
	public Class<List> returnedClass()
	{
	    return List.class;
	}
	
	@Override
	public boolean equals(Object o1, Object o2) throws HibernateException
	{
		return Util.equalsWithNull(o1, o2);
	}
	
	@Override
	public int hashCode(Object o) throws HibernateException
	{
		return o != null ? o.hashCode() : 0;
	}
	
	@Override
	public Object nullSafeGet(ResultSet resultSet, String[] strings, SharedSessionContractImplementor sessionImplementor, Object o) throws HibernateException, SQLException
	{
		List<String> list = null;
		String nameVal = resultSet.getString(strings[0]);
		if (nameVal != null)
		{
			nameVal = nameVal.substring(1, nameVal.length() - 1);
			list = new ArrayList<>();
			StringTokenizer tokenizer = new StringTokenizer(nameVal, ",");
			while (tokenizer.hasMoreElements())
			{
				String val = (String)tokenizer.nextElement();
				list.add(val.replaceAll("^\"", "").replaceAll("\"$", ""));
			}
		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public void nullSafeSet(PreparedStatement preparedStatement, Object o, int i, SharedSessionContractImplementor sessionImplementor) throws HibernateException, SQLException
	{
		if (o == null)
		{
			preparedStatement.setNull(i, Types.VARCHAR);
		}
		else
		{
			preparedStatement.setArray(i, sessionImplementor.connection().createArrayOf("varchar", ((List<String>)o).toArray()));
		}
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public Object deepCopy(Object o) throws HibernateException
	{
		return o != null ? new ArrayList<>((List<String>)o) : null;
	}
	
	@Override
	public boolean isMutable()
	{
		return false;
	}
	
	@Override
	public Serializable disassemble(Object o) throws HibernateException
	{
		return (Serializable)o;
	}
	
	@Override
	public Object assemble(Serializable serializable, Object o) throws HibernateException
	{
		return serializable;
	}
	
	@Override
	public Object replace(Object o, Object o1, Object o2) throws HibernateException
	{
		return deepCopy(o);
	}
	
}
