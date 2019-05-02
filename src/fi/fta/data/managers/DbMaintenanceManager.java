package fi.fta.data.managers;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.hibernate.HibernateException;

import fi.fta.beans.Pair;
import fi.fta.data.dao.CategoryBeanActionDAO;
import fi.fta.data.dao.CategoryDAO;
import fi.fta.data.dao.SimpleDAO;
import fi.fta.data.dao.UserDAO;
import fi.fta.data.dao.WFSInfoDAO;
import fi.fta.data.dao.WMSDAO;
import fi.fta.data.dao.WMSInfoDAO;
import fi.fta.utils.HibernateUtil;

/**
 * Database maintenance manager for executing optimizing queries
 * 
 * @author andrysta
 *
 */
public class DbMaintenanceManager
{
	
	public static void main(String[] args)
	{
		List<String> vacuum = new ArrayList<>();
		vacuum.add(new CategoryDAO().getTableName());
		vacuum.add(new CategoryBeanActionDAO().getTableName());
		vacuum.add(new WMSDAO().getTableName());
		vacuum.add(new WMSInfoDAO().getTableName());
		vacuum.add(new WFSInfoDAO().getTableName());
		vacuum.add(new UserDAO().getTableName());
		
		List<Pair<String, String>> cluster = new ArrayList<>();
		cluster.add(new Pair<>(new UserDAO().getTableName(), "users_email_idx"));
		
		try
    	{
    		HibernateUtil.create();
    		SimpleDAO<Object> dao = new SimpleDAO<>(Object.class);
    		for (String table : vacuum)
    		{
    			try
    			{
    				Logger.getRootLogger().info("DbMaintenanceManager.main > analyzing " + table);
    				dao.executeCustomSQLUpdateQuery("VACUUM ANALYZE " + table);
    			}
    			catch (HibernateException ex)
    			{
    				Logger.getRootLogger().error("DbMaintenanceManager.main.vacuum " + table + " Fatal error", ex);
    				ex.printStackTrace();
    			}
    		}
    		for (Pair<String, String> table : cluster)
    		{
    			try
    			{
    				Logger.getRootLogger().info("DbMaintenanceManager.main > clustering " + table.getFirst());
    				dao.executeCustomSQLUpdateQuery("CLUSTER " + table.getFirst() + " USING " + table.getSecond());
    			}
    			catch (HibernateException ex)
    			{
    				Logger.getRootLogger().error("DbMaintenanceManager.main.cluster " + table + " Fatal error", ex);
    				ex.printStackTrace();
    			}
    		}
    		try
			{
				Logger.getRootLogger().info("DbMaintenanceManager.main > refresh");
			}
			catch (HibernateException ex)
			{
				Logger.getRootLogger().error("DbMaintenanceManager.main.refresh > Fatal error", ex);
				ex.printStackTrace();
			}
    		
    	}
    	catch (HibernateException ex)
    	{
    		Logger.getRootLogger().error("DbMaintenanceManager.main.getConnection > Fatal error", ex);
    		ex.printStackTrace();
    	}
    	finally
    	{
    		try
			{
				HibernateUtil.close();
			}
			catch (HibernateException ex)
			{
				Logger.getRootLogger().error("DbMaintenanceManager.main.finalize > Fatal error", ex);
			}
    	}
		
	}
	
}
