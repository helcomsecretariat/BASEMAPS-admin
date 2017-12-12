package fi.fta.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class DAOUtil
{
	
	public static String toCSV(Collection<?> values)
	{
		return (!values.isEmpty() && values.iterator().next() instanceof Number) ?
			Util.toCSV(values) : Util.toCSV(values, "'", "'");
	}
	
	public static String prepareHibernateWhereClause(Map<String, Object> fields)
	{
		if (Util.isEmpty(fields))
			return "";
		
		StringBuffer q = new StringBuffer("where ");
		List<String> conditions = new ArrayList<String>(fields.size());
		for (String key : fields.keySet())
		{
			conditions.add(DAOUtil.prepareHibernateWhereCondition(key, fields.get(key)));
		}	
		q.append(DAOUtil.sqlAND(conditions));
		return q.toString();
	}
	
	public static String prepareHibernateWhereCondition(String field, Object value)
	{
		StringBuffer ret = new StringBuffer(field);
		if (value == null)
		{
			ret.append(" is null");
		}	
		else
		{
			if (value instanceof Number)
				ret.append(" = " + value);
			else if (value instanceof Collection)
				ret.append(" in (" + DAOUtil.toCSV((Collection<?>)value) + ")");
			else if (value instanceof Date)
				ret.append(" = '" + DateAndTimeUtils.dateToSQLDateF((Date)value) + "'");
			else
				ret.append(" = '" + value.toString() + "'");
		}
		return ret.toString();
	}
	
	protected static String sqlConditions(Collection<String> conditions, String logics)
	{
		StringBuffer ret = new StringBuffer("");
		if (!Util.isEmpty(conditions))
		{
			boolean first = true;
			for (String condition : conditions)
			{
				if (first)
					first = false;
				else
					ret.append(" " + logics + " ");
				ret.append(condition);
			}
		}
		return ret.toString();
	}
	
	public static String sqlAND(Collection<String> conditions)
	{
		return DAOUtil.sqlConditions(conditions, "AND");
	}
	
	public static String sqlOR(Collection<String> conditions)
	{
		return DAOUtil.sqlConditions(conditions, "OR");
	}
	
	public static String prepareHibernateOrderByClause(Map<String, Boolean> orders)
	{
		if (Util.isEmpty(orders))
			return "";
		
		StringBuffer q = new StringBuffer("order by ");
		boolean first = true;
		for (String key : orders.keySet())
		{
			if (first)
				first = false;
			else
				q.append(", ");
			q.append(key + " " + (Util.isTrue(orders.get(key)) ? "asc" : "desc"));
		}
		return q.toString();
	}
	
}
