<?php
/**
 * Created by PhpStorm.
 * User: benakamoorthi
 * Date: 7/9/18
 * Time: 7:34 PM
 */

namespace Piwik\Plugins\UsersManager\Sql;


use Piwik\Access;
use Piwik\Common;
use Piwik\Piwik;

class UserTableFilter
{
    /**
     * @var string
     */
    private $filterByRole;

    /**
     * @var int
     */
    private $filterByRoleSite;

    /**
     * @var string
     */
    private $filterSearch;

    public function __construct($filterByRole, $filterByRoleSite, $filterSearch)
    {
        $this->filterByRole = $filterByRole;
        $this->filterByRoleSite = $filterByRoleSite;
        $this->filterSearch = $filterSearch;

        if (isset($this->filterByRole) && !isset($this->filterByRoleSite)) {
            throw new \InvalidArgumentException("filtering by role is only supported for a single site");
        }

        // can only filter by superuser if current user is a superuser
        if ($this->filterByRole == 'superuser'
            && !Piwik::hasUserSuperUserAccess()
        ) {
            $this->filterByRole = null;
        }
    }

    public function getJoins($userTable)
    {
        $result = "LEFT JOIN " . Common::prefixTable('access') . " a ON $userTable.login = a.login AND (a.idsite IS NULL OR a.idsite = ?)";
        $bind = [$this->filterByRoleSite];

        return [$result, $bind];
    }

    public function getWhere()
    {
        $conditions = [];
        $bind = [];

        if ($this->filterByRole) {
            list($filterByRoleSql, $filterByRoleBind) = $this->getAccessSelectSqlCondition();

            $conditions[] = $filterByRoleSql;
            $bind = array_merge($bind, $filterByRoleBind);
        }

        if ($this->filterSearch) {
            $conditions[] = '(u.login LIKE ? OR u.email LIKE ?)';
            $bind = array_merge($bind, ['%' . $this->filterSearch . '%', '%' . $this->filterSearch . '%']);
        }

        // if the current user is not the superuser, only select users that have access to a site this user
        // has admin access to
        if (!Piwik::hasUserSuperUserAccess()) {
            $adminIdSites = Access::getInstance()->getSitesIdWithAdminAccess();

            $loginSql = 'SELECT DISTINCT ia.login FROM ' . Common::prefixTable('access') . ' ia WHERE ia.idsite IN ('
                . implode(',', $adminIdSites) . ')';

            $logins = \Piwik\Db::fetchAll($loginSql);
            $logins = array_column($logins, 'login');
            $logins = array_map('json_encode', $logins);

            $conditions[] = 'u.login IN (' . implode(',', $logins) . ')';
        }

        $result = implode(' AND ', $conditions);
        if (!empty($result)) {
            $result = 'WHERE ' . $result;
        }

        return [$result, $bind];
    }

    private function getAccessSelectSqlCondition()
    {
        $sql = '';
        $bind = [];

        switch ($this->filterByRole) {
            case 'noaccess':
                $sql = "(a.access IS NULL AND u.superuser_access <> 1)";
                break;
            case 'some':
                $sql = "(a.access IS NOT NULL OR u.superuser_access = 1)";
                break;
            case 'view':
            case 'admin':
                $sql = "a.access = ?";
                $bind[] = $this->filterByRole;
                break;
            case 'superuser':
                $sql = "u.superuser_access = 1";
                break;
        }

        return [$sql, $bind];
    }
}