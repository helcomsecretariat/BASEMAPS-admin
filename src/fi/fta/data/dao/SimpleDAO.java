package fi.fta.data.dao;

import java.io.Serializable;
import java.sql.SQLException;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.IntSupplier;

import javax.persistence.metamodel.EntityType;

import org.apache.log4j.Logger;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.metamodel.internal.MetamodelImpl;
import org.hibernate.persister.entity.EntityPersister;
import org.hibernate.persister.entity.Joinable;
import org.hibernate.query.Query;

import fi.fta.utils.DAOUtil;
import fi.fta.utils.HibernateUtil;

public class SimpleDAO<T>
{
	
	protected Class<T> cls;
	
	private SessionFactory sessionFactory;
	
	private boolean single;
	
	private Session session;
	
	private String entityName;
	
	private String tableName;
	
	private String[] keyColumnNames;
	
	public SimpleDAO(Class<T> cls)
	{
		this(cls, false);
	}
	
	public SimpleDAO(Class<T> cls, boolean single)
	{
		this.cls = cls;
		this.single = single;
		this.sessionFactory = this.retrieveSessionFactory();
	}
	
	protected SessionFactory retrieveSessionFactory()
	{
		return HibernateUtil.getSessionFactory();
	}
	
	public Session getCurrentSession()
	{
		if (single)
		{
			if (session == null || !session.isOpen())
			{
				session = sessionFactory.openSession();
			}
			return session;
		}
		
		return sessionFactory.getCurrentSession();
	}
	
	public T get(Serializable id) throws HibernateException
	{
		return this.transaction(
			(session) -> {
				return session.get(cls, id);
			});
	}
	
	public List<T> getAll() throws HibernateException
	{
		return this.executeCustomSelectQuery(
			new StringBuilder("from ").append(this.getEntityName()).toString());
	}
	
	public List<T> get(String key, Collection<?> ids) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("from ").append(this.getEntityName());
		sb.append(" where ").append(key).append(" in (");
		sb.append(DAOUtil.toCSV(ids));
		sb.append(")");
		return this.executeCustomSelectQuery(sb.toString());
	}
	
	public List<T> get(Collection<?> ids) throws HibernateException
	{
		return this.get(this.getSingleKey(), ids);
	}
	
	public List<T> executeCustomSelectQuery(String query) throws HibernateException
	{
		return new DAOSelectQueryUtil<T>(this.getCurrentSession(), query, cls).executeQuery();
	}
	
	public List<T> executeCustomSelectQuery(String query, int limit) throws HibernateException
	{
		return new DAOSelectQueryUtil<T>(this.getCurrentSession(), query, cls)
			{
				protected Query<T> setParameters(Query<T> q)
				{
					q.setMaxResults(limit);
					return super.setParameters(q);
				};
			}.executeQuery();
	}
	
	public int executeCustomUpdateQuery(String query) throws HibernateException
	{
		return new DAOUpdateQueryUtil(this.getCurrentSession(), query).executeQuery();
	}
	
	public List<T> executeCustomSQLQuery(String query) throws HibernateException
	{
		return (new DAOSelectQueryUtil<T>(this.getCurrentSession(), query, cls)
			{
				@Override
				public List<T> doQuery(Session session, String query)
				{
					return session.createNativeQuery(query, cls).getResultList();
				}
			}).executeQuery();
	}
	
	public int executeCustomSQLUpdateQuery(String query) throws HibernateException
	{
		return (new DAOUpdateQueryUtil(this.getCurrentSession(), query)
			{
				protected int ret;
				
				@Override
				public int doQuery(Session session, String query)
				{
					session.doWork((connection) -> {
						boolean ac = connection.getAutoCommit();
						try
						{
							connection.setAutoCommit(true);
							ret = connection.prepareStatement(query).executeUpdate();
							connection.setAutoCommit(ac);
						}
						catch (SQLException ex)
						{
							connection.setAutoCommit(ac);
							throw ex;
						}
					});
					return ret;
				}
			}).executeQuery();
	}
	
	public void executeCustomUpdateAsync(final IntSupplier supplier)
	{
		new Thread(() -> {
			try
			{
				supplier.getAsInt();
			}
			catch (HibernateException ex)
			{
				Logger.getRootLogger().error("update " + SimpleDAO.this.getEntityName() + " error", ex);
			}
		}).start();
	}
	
	protected String getEntityName()
	{
		if (entityName == null)
		{
			EntityType<T> md = sessionFactory.createEntityManager().getMetamodel().entity(cls);
			//check that the class is mapped to something with a table name
			if (md != null)
			{
				entityName = md.getName();
			}
		}
		return entityName;
	}
	
	protected String getTableName()
	{
		if (tableName == null)
		{
			EntityPersister ep = ((MetamodelImpl)sessionFactory.createEntityManager().getMetamodel()).entityPersister(cls);
			//check that the class is mapped to something with a table name
			if (ep != null && Joinable.class.isInstance(ep.getClassMetadata()))
			{
				tableName = Joinable.class.cast(ep.getClassMetadata()).getTableName();
			}	
		}
		return tableName;
	}
	
	protected String[] getKeyColumnNames()
	{
		if (keyColumnNames == null)
		{
			EntityPersister ep = ((MetamodelImpl)sessionFactory.createEntityManager().getMetamodel()).entityPersister(cls);
			//check that the class is mapped to something with a table name
			if (ep != null && Joinable.class.isInstance(ep.getClassMetadata()))
			{
				keyColumnNames = Joinable.class.cast(ep.getClassMetadata()).getKeyColumnNames();
			}
		}
		return keyColumnNames;
	}
	
	protected boolean singleKey()
	{
		String[] keys = this.getKeyColumnNames();
		return keys != null && keys.length == 1;
	}
	
	protected String getSingleKey()
	{
		return this.getKeyColumnNames()[0];
	}
	
	public List<T> getByField(String name, Object value) throws HibernateException
	{
		StringBuffer sb = new StringBuffer("from " + this.getEntityName() + " where ");
		sb.append(DAOUtil.prepareHibernateWhereCondition(name, value));
		return this.executeCustomSelectQuery(sb.toString());
	}
	
	public List<T> getByField(String name, Object value, String orderName, boolean asc) throws HibernateException
	{
		return getByField(name, value, orderName, asc, null);
	}
	
	public List<T> getByField(String name, Object value, String orderName, boolean asc, Integer limit) throws HibernateException
	{
		Map<String, Object> fields = new HashMap<String, Object>();
		fields.put(name, value);
		Map<String, Boolean> orderFields = new HashMap<String, Boolean>();
		orderFields.put(orderName, Boolean.valueOf(asc));
		return this.getByFields(fields, orderFields, limit);
	}
	
	public List<T> getByFields(Map<String, Object> fields)
	{
		return this.getByFields(fields, null, null);
	}
	
	public List<T> getByFields(Map<String, Object> fields, Map<String, Boolean> orderFields, Integer limit) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("from ").append(this.getEntityName());
		sb.append(" ").append(DAOUtil.prepareHibernateWhereClause(fields));
		if (orderFields != null)
		{
			sb.append(" ").append(DAOUtil.prepareHibernateOrderByClause(orderFields));
		}
		return limit != null ?
			this.executeCustomSelectQuery(sb.toString(), limit.intValue()) :
			this.executeCustomSelectQuery(sb.toString());
	}
	
	public boolean containsByFields(Map<String, Object> fields) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("select count(*) from ").append(this.getEntityName()).append(" ");
		sb.append(DAOUtil.prepareHibernateWhereClause(fields));
		return new DAOSelectUniqueQueryUtil<Long>(this.getCurrentSession(), sb.toString(), Long.class).executeQuery() > 0;
	}
	
	public boolean containsByField(String name, Object value) throws HibernateException
	{
		Map<String, Object> m = new HashMap<String, Object>(1);
		m.put(name, value);
		return this.containsByFields(m);
	}

	protected <R> R transaction(Function<Session, R> func)
	{
		Session session = this.getCurrentSession();
		Transaction tx = session.getTransaction();
		try
		{
			if (!tx.isActive())
			{
				tx.begin();
			}
			R ret = func.apply(session);
			tx.commit();
			return ret;
		}
		catch (HibernateException ex)
		{
			if (tx != null)
			{
				tx.rollback();
			}	
			throw ex;
		}
	}
	
	protected void close()
	{
		if (single && session != null && session.isOpen())
		{
			session.flush();
			session.close();
			session = null;
			System.out.println("GC: single session closed [" + this + "]");
		}
	}
	
	@Override
	protected void finalize() throws Throwable
	{
		this.close();
		super.finalize();
	}
	
}
