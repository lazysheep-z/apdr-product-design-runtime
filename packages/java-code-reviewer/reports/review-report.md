# Java 代码规范检查报告

| 项目 | 值 |
|------|-----|
| 生成时间 | 2026-05-25T06:13:12.596Z |
| 扫描文件 | 1 |
| 违规项数 | 26 |
| 基础分 | 100 |
| 总扣分 | -29 |
| **最终得分** | **71** |
| 及格线 | 70 |
| 结果 | ✅ 通过 |

## 按规范条目扣分汇总

| 规范编号 | 规则 | 次数 | 扣分 |
|----------|------|------|------|
| 一-2 | 强依赖具体实现，未面向抽象编程 | 2 | -4 |
| 一-5 | 业务逻辑侵入 Controller 层 | 2 | -4 |
| 二-24 | Java 未使用常量定义/魔法数字泛滥 | 3 | -3 |
| 一-1 | 违反分层单向依赖原则 | 1 | -2 |
| 一-6 | 滥用全局变量/单例/静态变量 | 1 | -2 |
| 一-7 | 实例化位置不当 | 1 | -2 |
| 一-8 | 异常处理链路缺失 | 1 | -2 |
| 一-10 | 集合访问无安全检查 | 1 | -2 |
| 一-12 | SQL 注入风险 | 1 | -2 |
| 一-15 | Java 禁止使用 System.out/err | 1 | -2 |
| 二-4 | 配置硬编码 | 1 | -1 |
| 二-13 | 违规捕获异常 | 1 | -1 |
| 二-22 | Java 日志不规范（字符串拼接） | 1 | -1 |
| 二-23 | Java 未使用连接池/手动创建连接 | 1 | -1 |
| 三-11 | 导包顺序混乱，无用依赖未清理 | 1 | -0 |
| 三-15 | 变量命名不规范 | 1 | -0 |
| 三-15 | 方法命名不规范 | 1 | -0 |
| 三-17 | 公共 API 无文档注释 | 2 | -0 |
| 三-32 | 异常捕获范围过大 | 1 | -0 |
| 三-34 | 未使用构造器注入/字段注入滥用 | 2 | -0 |

## 违规明细

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:4 — 违反分层单向依赖原则 (-2分)

- **规范编号**: 一-1
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: Controller 层禁止直接依赖 Repository/Mapper/Entity
- **规范说明**: 遵循 Controller→Service→Repository→Model 单向依赖，禁止 Controller 直接依赖 Repository/Mapper/Entity。

```java

import com.example.repository.UserRepository;
>>> import com.example.entity.User;
import java.util.*;
import java.sql.DriverManager;
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:5 — 导包顺序混乱，无用依赖未清理 (-0分)

- **规范编号**: 三-11
- **类别**: 三、一般合规项
- **严重级别**: info
- **问题**: 禁止使用通配符 import（import xxx.*）
- **规范说明**: 禁止通配符 import，保持 import 整洁。

```java
import com.example.repository.UserRepository;
import com.example.entity.User;
>>> import java.util.*;
import java.sql.DriverManager;

```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:10 — 滥用全局变量/单例/静态变量 (-2分)

- **规范编号**: 一-6
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: 禁止滥用 static 可变字段存储状态，高并发下会导致请求污染
- **规范说明**: 高并发下 static 可变字段会导致数据错乱、请求污染。

```java
@RestController
public class UserController {
>>>     private static List<String> cache = new ArrayList<>();

    @Autowired
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:12 — 未使用构造器注入/字段注入滥用 (-0分)

- **规范编号**: 三-34
- **类别**: 三、一般合规项
- **严重级别**: info
- **问题**: 推荐使用构造器注入，避免 @Autowired 字段注入
- **规范说明**: 推荐使用构造器注入，避免 @Autowired 字段注入。

```java
    private static List<String> cache = new ArrayList<>();

>>>     @Autowired
    private UserServiceImpl userService;

```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:13 — 强依赖具体实现，未面向抽象编程 (-2分)

- **规范编号**: 一-2
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: 禁止直接注入实现类「UserServiceImpl」，应依赖接口
- **规范说明**: Service 层必须依赖抽象接口，禁止直接注入 *Impl 实现类。

```java

    @Autowired
>>>     private UserServiceImpl userService;

    public List<User> getUsers() {
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:13 — 强依赖具体实现，未面向抽象编程 (-2分)

- **规范编号**: 一-2
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: 禁止直接注入实现类「UserServiceImpl」，应依赖接口
- **规范说明**: Service 层必须依赖抽象接口，禁止直接注入 *Impl 实现类。

```java

    @Autowired
>>>     private UserServiceImpl userService;

    public List<User> getUsers() {
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:15 — 公共 API 无文档注释 (-0分)

- **规范编号**: 三-17
- **类别**: 三、一般合规项
- **严重级别**: info
- **问题**: public 方法缺少 Javadoc 注释
- **规范说明**: public 类和方法应有 Javadoc。

```java
    private UserServiceImpl userService;

>>>     public List<User> getUsers() {
        return userRepository.findAll().get(0);
    }
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:16 — 集合访问无安全检查 (-2分)

- **规范编号**: 一-10
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: 集合/数组取值前必须判空或检查长度，禁止直接 get(0)/[0]
- **规范说明**: List/数组取值前必须判空，禁止在长度未确认时直接 get(0)/[0]。

```java

    public List<User> getUsers() {
>>>         return userRepository.findAll().get(0);
    }

```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:19 — 业务逻辑侵入 Controller 层 (-2分)

- **规范编号**: 一-5
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: Controller 层应只做参数校验与返回封装，业务逻辑需下沉 Service
- **规范说明**: Controller 只允许参数接收、校验、返回封装，禁止事务/循环/计算等业务逻辑。

```java
    }

>>>     @Transactional
    public void ProcessOrder(int id) {
        if (id == 42) {
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:20 — 方法命名不规范 (-0分)

- **规范编号**: 三-15
- **类别**: 三、一般合规项
- **严重级别**: info
- **问题**: 方法名「ProcessOrder」应使用 lowerCamelCase
- **规范说明**: 方法名应使用 lowerCamelCase。

```java

    @Transactional
>>>     public void ProcessOrder(int id) {
        if (id == 42) {
            System.out.println("order " + id);
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:20 — 公共 API 无文档注释 (-0分)

- **规范编号**: 三-17
- **类别**: 三、一般合规项
- **严重级别**: info
- **问题**: public 方法缺少 Javadoc 注释
- **规范说明**: public 类和方法应有 Javadoc。

```java

    @Transactional
>>>     public void ProcessOrder(int id) {
        if (id == 42) {
            System.out.println("order " + id);
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:21 — Java 未使用常量定义/魔法数字泛滥 (-1分)

- **规范编号**: 二-24
- **类别**: 二、优化建议
- **严重级别**: warning
- **问题**: 魔法数字 42 应提取为命名常量
- **规范说明**: 数字、字符串硬编码应抽离为 public static final 常量。

```java
    @Transactional
    public void ProcessOrder(int id) {
>>>         if (id == 42) {
            System.out.println("order " + id);
        }
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:22 — Java 禁止使用 System.out/err (-2分)

- **规范编号**: 一-15
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: 禁止使用 System.out/err，应使用日志框架
- **规范说明**: 禁止 System.out/err，应使用 SLF4J 等日志框架。

```java
    public void ProcessOrder(int id) {
        if (id == 42) {
>>>             System.out.println("order " + id);
        }
        String sql = "select * from orders where id=" + id;
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:24 — SQL 注入风险 (-2分)

- **规范编号**: 一-12
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: 禁止拼接用户输入到 SQL，必须使用参数化查询
- **规范说明**: 禁止直接拼接用户输入到 SQL，必须使用参数化查询。

```java
            System.out.println("order " + id);
        }
>>>         String sql = "select * from orders where id=" + id;
        for (int i = 0; i < 10; i++) {
            new RestTemplate();
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:25 — 业务逻辑侵入 Controller 层 (-2分)

- **规范编号**: 一-5
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: Controller 层应只做参数校验与返回封装，业务逻辑需下沉 Service
- **规范说明**: Controller 只允许参数接收、校验、返回封装，禁止事务/循环/计算等业务逻辑。

```java
        }
        String sql = "select * from orders where id=" + id;
>>>         for (int i = 0; i < 10; i++) {
            new RestTemplate();
        }
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:25 — Java 未使用常量定义/魔法数字泛滥 (-1分)

- **规范编号**: 二-24
- **类别**: 二、优化建议
- **严重级别**: warning
- **问题**: 魔法数字 10 应提取为命名常量
- **规范说明**: 数字、字符串硬编码应抽离为 public static final 常量。

```java
        }
        String sql = "select * from orders where id=" + id;
>>>         for (int i = 0; i < 10; i++) {
            new RestTemplate();
        }
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:26 — 实例化位置不当 (-2分)

- **规范编号**: 一-7
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: 禁止在循环或高频路径中重复创建 Client/Connection 等重型对象
- **规范说明**: 禁止在循环、高频调用逻辑中重复创建 Client/Connection 等重型对象。

```java
        String sql = "select * from orders where id=" + id;
        for (int i = 0; i < 10; i++) {
>>>             new RestTemplate();
        }
        try {
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:29 — 配置硬编码 (-1分)

- **规范编号**: 二-4
- **类别**: 二、优化建议
- **严重级别**: warning
- **问题**: 环境配置/IP/超时时间禁止硬编码，应放入配置中心
- **规范说明**: 环境配置、IP、超时必须放入配置中心，禁止写死代码。

```java
        }
        try {
>>>             DriverManager.getConnection("jdbc:mysql://192.168.1.100:3306/db", "u", "p");
        } catch (Exception e) {}
        log.info("done " + id);
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:29 — Java 未使用连接池/手动创建连接 (-1分)

- **规范编号**: 二-23
- **类别**: 二、优化建议
- **严重级别**: warning
- **问题**: 禁止 DriverManager 直连，应使用连接池（如 HikariCP）
- **规范说明**: 禁止 JDBC DriverManager 直连，应使用 HikariCP 等连接池。

```java
        }
        try {
>>>             DriverManager.getConnection("jdbc:mysql://192.168.1.100:3306/db", "u", "p");
        } catch (Exception e) {}
        log.info("done " + id);
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:29 — Java 未使用常量定义/魔法数字泛滥 (-1分)

- **规范编号**: 二-24
- **类别**: 二、优化建议
- **严重级别**: warning
- **问题**: 魔法数字 3306 应提取为命名常量
- **规范说明**: 数字、字符串硬编码应抽离为 public static final 常量。

```java
        }
        try {
>>>             DriverManager.getConnection("jdbc:mysql://192.168.1.100:3306/db", "u", "p");
        } catch (Exception e) {}
        log.info("done " + id);
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:30 — 异常处理链路缺失 (-2分)

- **规范编号**: 一-8
- **类别**: 一、核心红线
- **严重级别**: error
- **问题**: catch 块为空，禁止静默失败
- **规范说明**: 所有 IO/网络/数据库操作必须有成功、失败、超时处理，禁止静默失败。

```java
        try {
            DriverManager.getConnection("jdbc:mysql://192.168.1.100:3306/db", "u", "p");
>>>         } catch (Exception e) {}
        log.info("done " + id);
    }
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:30 — 违规捕获异常 (-1分)

- **规范编号**: 二-13
- **类别**: 二、优化建议
- **严重级别**: warning
- **问题**: catch 块为空，禁止静默失败
- **规范说明**: 异常必须记录日志 + 返回调用方，禁止静默处理（与核心红线互补检测）。

```java
        try {
            DriverManager.getConnection("jdbc:mysql://192.168.1.100:3306/db", "u", "p");
>>>         } catch (Exception e) {}
        log.info("done " + id);
    }
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:30 — 异常捕获范围过大 (-0分)

- **规范编号**: 三-32
- **类别**: 三、一般合规项
- **严重级别**: info
- **问题**: 避免直接 catch Exception，应捕获具体异常类型
- **规范说明**: 避免直接 catch Exception，应捕获具体异常。

```java
        try {
            DriverManager.getConnection("jdbc:mysql://192.168.1.100:3306/db", "u", "p");
>>>         } catch (Exception e) {}
        log.info("done " + id);
    }
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:31 — Java 日志不规范（字符串拼接） (-1分)

- **规范编号**: 二-22
- **类别**: 二、优化建议
- **严重级别**: warning
- **问题**: 日志应使用占位符 {} 而非字符串拼接
- **规范说明**: 日志应使用占位符 {}，禁止 log.info("..." + var) 直接拼接。

```java
            DriverManager.getConnection("jdbc:mysql://192.168.1.100:3306/db", "u", "p");
        } catch (Exception e) {}
>>>         log.info("done " + id);
    }

```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:34 — 未使用构造器注入/字段注入滥用 (-0分)

- **规范编号**: 三-34
- **类别**: 三、一般合规项
- **严重级别**: info
- **问题**: 推荐使用构造器注入，避免 @Autowired 字段注入
- **规范说明**: 推荐使用构造器注入，避免 @Autowired 字段注入。

```java
    }

>>>     @Autowired
    private UserRepository userRepository;
}
```

### packages/java-code-reviewer/fixtures/team-violations/UserController.java:48 — 变量命名不规范 (-0分)

- **规范编号**: 三-15
- **类别**: 三、一般合规项
- **严重级别**: info
- **问题**: 类名「log」应使用 UpperCamelCase
- **规范说明**: 类名 UpperCamelCase，方法/变量 lowerCamelCase，常量 UPPER_SNAKE_CASE。

```java
@interface Transactional {}
class RestTemplate {}
>>> class log {
    static void info(String s) {}
}
```
