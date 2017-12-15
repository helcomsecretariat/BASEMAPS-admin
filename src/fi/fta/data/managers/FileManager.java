package fi.fta.data.managers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;
import java.util.Date;

public abstract class FileManager
{
	
	public static final String CONTENT_FILE_NAME = "cntnt";
	public static final String DEFAULT_CHARSET = "UTF-8";
	
	protected Boolean pathLock;
	
	protected File path;
	
	protected Charset charset;
	
	protected String contentName;
	
	public FileManager(String path)
	{
		this(new File(path), FileManager.DEFAULT_CHARSET);
	}
	
	public FileManager(File path)
	{
		this(path, FileManager.DEFAULT_CHARSET);
	}
	
	public FileManager(String path, String charset)
	{
		this(new File(path), charset);
	}
	
	public FileManager(File path, String charset)
	{
		this.pathLock = Boolean.valueOf(true);
		this.path = path;
		this.charset = Charset.forName(charset);
		this.contentName = FileManager.CONTENT_FILE_NAME;
	}
	
	public String getContentName()
	{
		return contentName;
	}
	
	public void setContentName(String contentName)
	{
		this.contentName = contentName;
	}
	
	protected abstract File getFile(Object id);
	
	public String get(Object id) throws IOException
	{
		File file = this.getFile(id);
		if (!file.exists() || !file.isFile())
			return null;
		
		InputStreamReader in = new InputStreamReader(new FileInputStream(file), charset);
		StringBuffer ret = new StringBuffer();
		char buf[] = new char[10240];
		for (int i = 0; (i = in.read(buf)) > 0; ) 
			ret.append(buf, 0, i);
		in.close();
		return ret.toString();
	}
	
	public Date getLastModified(Object id)
	{
		File file = this.getFile(id);
		if (!file.exists() || !file.isFile())
			return null;
		return new Date(file.lastModified());
	}
	
	public boolean contains(Object id)
	{
		return this.getFile(id).exists();
	}
	
	public void add(Object id, String content) throws IOException
	{
		synchronized (pathLock)
		{
			if (!path.exists())
				path.mkdirs();
			
			File file = this.getFile(id);
			if (!file.getParentFile().exists())
				file.getParentFile().mkdirs();
			if (!file.exists())
				file.createNewFile();
			
			OutputStreamWriter out = new OutputStreamWriter(new FileOutputStream(file), charset);
			out.write(content);
			out.close();
		}
	}
	
	public void delete(Object id)
	{
		synchronized (pathLock)
		{
			File file = this.getFile(id);
			if (!file.exists())
				return;
			
			do
			{
				file.delete();
				file = file.getParentFile();
			}
			while (!file.equals(path) && file.list().length == 0);
		}
	}
	
	public void update(Object id, String content) throws IOException
	{
		this.delete(id);
		this.add(id, content);
	}
	
}
